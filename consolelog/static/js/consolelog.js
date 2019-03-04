/*
 * View model for ConsoleLog
 *
 * Author: OutsourcedGuru
 * License: AGPLv3
 */
$(function() {
    window.console = (function (origConsole) {
        if (!window.console || !origConsole)    {origConsole = {};}
        var logArray =                          {
                                                logs: [],
                                                errors: [],
                                                warns: [],
                                                infos: []
                                                };
        return {
            log: function () {
                //this.addLog(arguments, "logs");
                origConsole.log && origConsole.log.apply(origConsole, arguments);
            },
            warn: function () {
                this.addLog(arguments, "warns");
                origConsole.warn && origConsole.warn.apply(origConsole, arguments);
            },
            error: function () {
                this.addLog(arguments, "errors");
                origConsole.error && origConsole.error.apply(origConsole, arguments);
            },
            info: function (v) {
                //this.addLog(arguments, "infos");
                origConsole.info && origConsole.info.apply(origConsole, arguments);
            },
            addLog: function (arguments, array) {
                logArray[array || "logs"].push(arguments);
            },
            logArray: function () {
                return logArray;
            }
        };
    }(window.console));

    function ConsolelogViewModel(parameters) {
        var self =                          this;
        self.currentLogErrors =             ko.observable(false);
        self.currentLogIssue =              ko.observable(false);
        self.getErrorCount =                ko.observable(0);
        var logArray =                      console.logArray();

        self.requestData = function() {
            // console.error('Simulated Error');
            self.currentLogErrors(logArray.errors.length != 0);
            self.currentLogIssue(logArray.errors.length != 0);
            self.getErrorCount(logArray.errors.length);
        };

        self.popoverContent = ko.pureComputed(function() {
            var consoleParagraphClasses =   "muted";
            var consoleSymbolClasses =      "";
            if (self.currentLogErrors()) {
                consoleSymbolClasses =      "text-error consolelog_pulsate";
                consoleParagraphClasses =   "";
            }
            strHtml =                       "<p class='" + consoleParagraphClasses + "'>" +
                                            "<strong class='" + consoleSymbolClasses + "'>" + logArray.errors.length.toString() +
                                            "<i class='fa fa-exclamation'></i></strong> - " +
                                            gettext("JavaScript error(s). Please visit the developer's console to review them.") +
                                            "</p>";
            for (var i=0; i<logArray.errors.length; i++) {
                strHtml +=                  "<p class='text-error'>&bull; " + logArray.errors[i][0];
                var addHtml =               ""
                for (var j=1; j<logArray.errors[i].length; j++) {
                    addHtml +=              ((typeof logArray.errors[i][j]) == "string") ? " " + logArray.errors[i][j] : "";
                }
                addHtml =                   addHtml.substr(0, 20);
                strHtml +=                  addHtml + "</p>";
            }
            strHtml += "<p><small>" + gettext("Click the symbol in the navbar for more information.") + "</small></p>";
            return strHtml; 
        });

        self.onAfterStartup =               function() {self.requestData();};
        self.onServerReconnect =            function() {self.requestData();};
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: ConsolelogViewModel,
        dependencies: [],
        elements: ["#navbar_plugin_consolelog"]
    });
});
