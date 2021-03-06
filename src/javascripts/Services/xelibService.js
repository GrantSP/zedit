ngapp.service('xelibService', function() {
    let service = this;

    this.getExceptionInformation = function() {
        try {
            console.log(xelib.GetMessages());
            console.log(xelib.GetExceptionMessage());
        } catch (e) {
            console.log("Failed to get exception information: " + e);
        }
    };

    this.printGlobals = function() {
        try {
            console.log(xelib.GetGlobals());
        } catch (e) {
            console.log(e);
            service.getExceptionInformation();
        }
    };

    this.startSession = function(profile) {
        xelib.SetGamePath(profile.gamePath);
        xelib.SetLanguage(profile.language);
        xelib.SetGameMode(profile.gameMode);
    };
});
