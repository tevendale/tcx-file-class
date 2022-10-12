"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const author_1 = require("./author");
const creator_1 = require("./creator");
const pstring = require("xml2js");
const consts = require("./consts");
const lap_1 = require("./lap");
const pString = pstring.parseString;
/**
 * Το κεντρικό αντικείμενο που διαχειρίζεται το TCX αρχείο
 */
class TcxFile extends events_1.EventEmitter {
    /**
     * Δημιουργία του αντικειμένου που διαβάζει τα δεδομένα από TCX  αρχείο
     *
     * @param {string} filename το όνομα του αρχείου TCX
     * @param {function} callback η συνάρτηση που καλείται όταν διαβάσει το αρχείο. Αν
     * υπάρχει λάθος, τότε η callback(err:string) επιστρέφει το λάθος στην err
     */
    //constructor(filename:string, callback:(err:string)=>void){
    constructor() {
        super();
        /**Όλα τα δεδομένα του αρχείου σε ΧΜL μορφή */
        this.data = null;
        /**Κρατάει την τιμή του λάθους, αν υπάρχει, στην ανάγωνση του TCX αρχείου */
        this.isError = consts.ERROR_STRING_VALUE;
        /**Ετοιμότητα του αντικειμένου */
        this.isReady = false;
    }
    /**Διαβάζει την ιδότητα Id του ΤCX αρχείου
     * @return {string} id η τσυτότητα της δραστηριότητας
    */
    getId() {
        let id = "";
        let self = this;
        if (self.isReady) {
            id = self.data.TrainingCenterDatabase.Activities[0].Activity[0].Id[0];
        }
        return id;
    }
    ;
    /**Διαβάσει το τύπο του Sport από το TCX αρχείο
     * @returns {string} sport το άθλημα της δραστηριότητας
      */
    getSport() {
        let sport;
        let self = this;
        if (self.isReady) {
            sport = self.data.TrainingCenterDatabase.Activities[0].Activity[0].$.Sport;
        }
        return sport;
    }
    ;
    /**
     * Συμπληρώνει ένα αντικείμενο Author με τα στοχεία (αν υπάρχουν) στο TCX αρχείο
     *
     * @returns {Author} author αντικείμενο Author η null
     */
    getAuthor() {
        let author = null;
        let self = this;
        //runtastic does not have author record
        if (self.isReady && self.data.TrainingCenterDatabase.Author !== undefined) {
            author = new author_1.Author(self.data.TrainingCenterDatabase.Author[0]);
        }
        return author;
    }
    ;
    /**
     * Ελέγχει αν το αρχείο έχει στοιχεία Creator
     * @return {boolean} true ή false
     */
    hasCreator() {
        let self = this;
        if (self.isReady) {
            return self.data.TrainingCenterDatabase.$.creator !== undefined || self.data.TrainingCenterDatabase.Activities[0].Activity[0].Creator !== undefined;
        }
        return false;
    }
    ;
    /**
    * Συμπληρώνει ένα αντικείμενο Creator με τα στοχεία (αν υπάρχουν) στο TCX αρχείο
    *
    * @returns {Creator} creator αντικείμενο Creator η null
    */
    getCreator() {
        let creator = null;
        let self = this;
        if (self.isReady && self.hasCreator()) {
            if (self.data.TrainingCenterDatabase.$.creator !== undefined) {
                creator = new creator_1.Creator();
                creator.name = self.data.TrainingCenterDatabase.$.creator;
                creator.isRuntastic = true;
            }
            else {
                creator = new creator_1.Creator(self.data.TrainingCenterDatabase.Activities[0].Activity[0].Creator[0]);
                creator.isRuntastic = false;
            }
        }
        return creator;
    }
    ;
    /**
     * Συμπληρώνει ένα πίνακα με όλα τα Laps του αρχείου TCX
     *
     * @return τον πίνακα σε μορφή Array<Lap>
     */
    getLaps() {
        let laps = Array();
        let self = this;
        if (self.isReady) {
            let lapCount = self.data.TrainingCenterDatabase.Activities[0].Activity[0].Lap.length;
            for (let i = 0; i != lapCount; ++i) {
                laps.push(new lap_1.Lap(self.data.TrainingCenterDatabase.Activities[0].Activity[0].Lap[i]));
            }
        }
        return laps;
    }
    ;
    /**
     * Ανάγνωση αρχείου TCX και απόδοση των στοιχείων του στο obj αντικείμενο TcxFile
     *
     * @param {TcxFile} obj το αντικείμενο που θα διαβάσουμε
     * @param {string} filename το όνομα του αρχείου
     * @param callback η συνάρτηση που επιστρέφει (err, data). Όπου data σε μορφή iXmlData
     * το σύνολο των δεδομένων του TCX αρχείου (filename)
     */
    readFromString(source, callback) {
        let self = this;
        pString(source, function (err, result) {
            if (!err) {
                self.data = result;
                self.isError = consts.ERROR_STRING_VALUE;
                self.isReady = true;
                self.emit('endReading', null);
                callback(null, result);
            }
            else {
                self.isError = err.message;
                self.data = null;
                self.isReady = false;
                self.emit('endReading', err);
                callback(err, null);
            }
        });
    }
}
exports.TcxFile = TcxFile;
//# sourceMappingURL=tcxFile.js.map