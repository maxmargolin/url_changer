window.onload = function() {
        var views = 0;
        var start = 0;
        var end = 0;
        var InnerIndex = 1;
        var year = 1918;
        var currentID = "default";
        var videoLength = "default";
        var currentChannelID = "cdefault";
        chrome.tabs.query({
                active: true,
                currentWindow: true
        }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                        req: "id"
                }, function(response) { //ask for information for this page
                        videoLength = response.vLength;
                        currentID = response.cvID;
                        currentChannelID = response.ccID;
                        year = (response.published).match(/ (\d{4})/)[0]; //get year
                        try {

                                views = response.views;
                                var name = response.name;
                                var top = document.createElement("span");
                                top.innerHTML = name;
                                var tspace = document.getElementById("tspace");
                                $(top).hide().appendTo(tspace).fadeIn(300);


                        } catch (err) {}
                        if (currentID.length !== 11) {
                                document.getElementById('start').style.display = "none";
                                document.getElementById('end').style.display = "none";
                                document.getElementById('setButton').style.display = "none";
                                document.getElementById('sethr').style.display = "none";
                                document.getElementById('addMid').style.display = "none";
                                document.getElementById('icon1').style.display = "none";
                                document.getElementById('icon2').style.display = "none";
                                document.getElementById('starttext').style.display = "none";
                                document.getElementById('endtext').style.display = "none";
                        }


                        // sync storage before local
                        chrome.storage.sync.get(currentID, function(result) {
                                var lookForEnd = true;
                                var lookForStart = true;
                                var localInner = true;
                                try {
                                        start = result[currentID][0];
                                        end = result[currentID][result[currentID].length - 1];

                                        if (start != undefined) {
                                                lookForStart = false;
                                                setStart(start);
                                        }
                                        localInner = !(ShowInnerSkips(result[currentID]));
                                        if (end != undefined) {
                                                setEnd(end, videoLength);
                                                lookForEnd = false;

                                        }
                                } catch (err) {}

                                chrome.storage.local.get(currentID, function(sresult) {
                                        if (localInner && (sresult[currentID] != undefined && sresult[currentID].length > 2)) {
                                                ShowInnerSkips(sresult[currentID]);
                                        }

                                        if (lookForStart) {
                                                try {
                                                        var start = sresult[currentID][0];
                                                        if (start != undefined) {
                                                                setStart(start);
                                                                lookForStart = false

                                                        }
                                                } catch (err) {}
                                        }
                                        if (lookForEnd) {
                                                try {
                                                        if ((sresult[currentID].length - 1) % 2 == 1) {

                                                                end = sresult[currentID][sresult[currentID].length - 1];
                                                                setEnd(end, videoLength);
                                                                lookForEnd = false;
                                                        }

                                                } catch (err) {}
                                        }
                                });


                                // channel times

                                if (lookForStart || lookForEnd) { //look for channel start/end - synced

                                        chrome.storage.sync.get(currentChannelID, function(scresult) {
                                                if (scresult != undefined) {
                                                        try {
                                                                if (lookForStart) {
                                                                        var start = scresult[currentChannelID][0];
                                                                        if (start != undefined && start != 0) {
                                                                                setStart(start);
                                                                                lookForStart = false;
                                                                        }
                                                                }

                                                                if (lookForEnd) { //look for channel start/end - synced
                                                                        var end = scresult[currentChannelID][1];
                                                                        if (end != undefined) {
                                                                                setEnd(end, videoLength);
                                                                                lookForEnd = false;
                                                                        }
                                                                }
                                                        } catch (err) {}
                                                }
                                        });
                                }



                                if (lookForStart || lookForEnd) { //look for channel start/end - local

                                        chrome.storage.local.get(currentChannelID, function(lresult) {
                                                if (lresult != undefined) {
                                                        try {
                                                                if (lookForStart) {
                                                                        var start = lresult[currentChannelID][0];
                                                                        if (start != undefined && start != 0) {
                                                                                setStart(start);
                                                                                lookForStart = false;
                                                                        }
                                                                }

                                                                if (lookForEnd) { //look for channel start/end - synced
                                                                        var end = lresult[currentChannelID][1];
                                                                        if (end != undefined && end != 0) {
                                                                                setEnd(end, videoLength);
                                                                                lookForEnd = false;
                                                                        }
                                                                }
                                                        } catch (err) {}
                                                }
                                        });
                                }




                        });

                });
        });


        function AddMidRow(timeA, timeB, index) {
                InnerIndex += 2;
                if (InnerIndex >= 6)
                        document.getElementById('addMid').style.display = "none";
                var text1 = document.createElement("span");
                var text2 = document.createElement("span");
                text1.setAttribute("size", "3");
                text2.setAttribute("size", "3");
                text1.innerHTML = "Jump from ";
                text2.innerHTML = " to ";
                var a = document.createElement("input");
                a.setAttribute("type", "text");
                a.value = ToTime(timeA);
                a.setAttribute("id", String.fromCharCode(96 + index));
                a.setAttribute("class", "innerBox");
                var b = document.createElement("input");
                b.setAttribute("type", "text");
                b.value = ToTime(timeB);
                b.setAttribute("id", String.fromCharCode(97 + index));
                b.setAttribute("class", "innerBox");
                var element = document.getElementById("extra");
                var del = document.createElement("i");
                del.setAttribute("aria-hidden", true);
                del.setAttribute("class", "fa fa-times");


                $(del).hide().appendTo(element).fadeIn(300);
                $(text1).hide().appendTo(element).fadeIn(300);
                $(a).hide().appendTo(element).fadeIn(300);
                $(text2).hide().appendTo(element).fadeIn(300);
                $(b).hide().appendTo(element).fadeIn(300);
                del.onclick = function() {
                        InnerIndex -= 2;
                        if (InnerIndex < 6)
                                document.getElementById('addMid').style.display = "block";
                        b.remove();
                        a.remove();
                        text2.remove();
                        text1.remove();
                        del.remove();
                };

        }

        function ShowInnerSkips(times) {
                var index = 1;
                var found = false;
                while (index < times.length - 1) {
                        found = true;
                        if (times[index] > 0 && times[index + 1] > 0) {

                                AddMidRow(times[index], times[index + 1], index);
                        }
                        index += 2;
                }
                return found;
        }



        var tt = "0";
        document.getElementById("more").addEventListener("click", show);

        function show() {

                document.getElementById("expand2").style.display = "block";
                document.getElementById("more").style.display = "none"

        }

        chrome.storage.sync.get("totalTime", function(time) {
                if (time["totalTime"] != undefined) {
                        tt = time["totalTime"];
                        if (tt > 0)
                                document.getElementById("rate").style.display = "block";
                        if (tt > 100000)
                                tt = Math.floor(tt / 1000) + "k";
                        document.getElementById('counter').innerHTML = tt;
                        document.getElementById("fb").setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=bit.ly/skippershare&quote=This%20extension%20already%20saved%20me%20" + tt + "%20seconds!");
                        document.getElementById("tw").setAttribute("href", "https://twitter.com/intent/tweet?text=This%20extension%20already%20saved%20me%20" + tt + "%20seconds!%20http://bit.ly/skippershare");
                        document.getElementById("email").setAttribute("href", "mailto:?Subject=This%20Chrome%20extension%20already%20saved%20me%20" + tt + "%20seconds!&Body='Skipper%20-%20Music%20Mode%20For%20YouTube'%20%20skips%20to%20the%20actual%20song/video%20for%20you,%20You%20should%20Check%20it%20out:%20%20https://chrome.google.com/webstore/detail/skipper-music-mode-for-yo/chojffponkoboggmjpnkflkbcelacijk");

                }
        });


        chrome.storage.local.get("on", function(result) {
                document.getElementById("slideThree").checked = result["on"];
        });
        chrome.storage.local.get("ChangeURL", function(result) {
                document.getElementById("cb3").checked = result["ChangeURL"];
        });

        chrome.storage.local.get("adv", function(result) {
                document.getElementById("cb1").checked = result["adv"];
                if (result["adv"]) { //advanced on
                        document.getElementById("advs2").style.display = "block";
                        document.getElementById("advs3").style.display = "block";
                        document.getElementById("advs4").style.display = "block";
                }
        });


        function ToTime(seconds) {
                seconds = String(parseInt(seconds));
                if (seconds <= 0 || isNaN(seconds))
                        return "0:00";
                if (parseInt(seconds) < 3600)
                        return parseInt(Math.floor(seconds / 60)) + ":" + parseInt((seconds % 60) / 10) + parseInt(seconds % 10);
                else
                        return parseInt(Math.floor(seconds / 3600)) + ":" + Math.floor((seconds % 3600) / 60) + ":" + parseInt(seconds % 60);

        }

        function ToSeconds(str) {
                str = str + '';
                var p = str.split(':'),
                        s = 0,
                        m = 1;

                while (p.length > 0) {
                        s += m * parseInt(p.pop(), 10);
                        m *= 60;
                }
                return s;
        }

        function setStart(start) {
                document.getElementById('start').value = ToTime(start);
                document.getElementById('startc').innerHTML = ToTime(start);
        }

        function setEnd(end, length) {
                if (end == 0) {
                        //dont do shiet
                } else if (end > 0) { //deal with postive and negative representations
                        document.getElementById('end').value = ToTime(end);
                        document.getElementById('endc').innerHTML = "-" + ToTime(length - end);
                } else {
                        document.getElementById('endc').innerHTML = "-" + ToTime(-end);
                        document.getElementById('end').value = ToTime(length + end);
                }

        }


        var onoffcb = document.querySelector("input[name=check]");
        onoffcb.addEventListener('change', function() {
                var obj = {};
                if (this.checked) {
                        obj["on"] = true;
                        chrome.storage.local.set(obj);
                } else {
                        obj["on"] = false;
                        chrome.storage.local.set(obj);
                }
        });




        var urlcb = document.querySelector("input[name=cb3]");
        urlcb.addEventListener('change', function() {
                var obj = {};
                obj["ChangeURL"] = this.checked;
                chrome.storage.local.set(obj);
        });






        //save button
        (function() {
                var removeSuccess;

                removeSuccess = function() {
                        return $('.button').removeClass('success');
                };

                $(document).ready(function() {
                        return $('.button').click(function() {
                                $(this).addClass('success');
                                return setTimeout(removeSuccess, 1000);
                        });
                });

        }).call(this);


        //text changes
        var e = document.getElementById('end');
        e.oninput = function() {
                endText = $('#end').val();
                if (endText == "0")
                        document.getElementById('endc').innerHTML = "-0:00";
                else
                        document.getElementById('endc').innerHTML = "-" + ToTime(videoLength - ToSeconds(endText));
        };
        var s = document.getElementById('start');
        s.oninput = function() {
                document.getElementById('startc').innerHTML = ToTime(ToSeconds($('#start').val()));
        };

        //where to send
        try {
                var config = {
                        apiKey: "AIzaSyCwUoS6G3piAXhtrs9Cp1TzVfIPxeOg9vI",
                        authDomain: "skipper-63ddb.firebaseapp.com",
                        databaseURL: "https://skipper-63ddb.firebaseio.com",
                        projectId: "skipper-63ddb",
                        storageBucket: "skipper-63ddb.appspot.com",
                        messagingSenderId: "13095823735"
                };
                //get ready
                firebase.initializeApp(config);
        } catch (err) {}

        var advcb = document.querySelector("input[name=cb]");
        advcb.addEventListener('change', function() {
                var obj = {};
                if (this.checked) {
                        document.getElementById("advs2").style.display = "block";
                        document.getElementById("advs3").style.display = "block";
                        document.getElementById("advs4").style.display = "block";
                        obj["adv"] = true;
                        chrome.storage.local.set(obj);
                        chrome.storage.sync.get("uidBeta", function(res) {
                                userID = res["uidBeta"];
                                firebase.database().ref("/tried_advanced/" + userID).set({
                                        "in": "alpha"
                                });
                        });
                        //xko
                } else {
                        document.getElementById("cb2").checked = false; //channel start
                        document.getElementById("cb4").checked = false; //channel end
                        document.getElementById("cb3").checked = false;
                        document.getElementById("advs2").style.display = "none";
                        document.getElementById("advs3").style.display = "none";
                        document.getElementById("advs4").style.display = "none";
                        var objurl = {};
                        objurl["ChangeURL"] = false;
                        chrome.storage.local.set(objurl);
                        obj["adv"] = false;
                        chrome.storage.local.set(obj);
                }
        });


        document.getElementById('setButton').onclick = function() {
                var newStart = Math.max(ToSeconds($('#start').val()), 0);
                var newEnd = Math.max(ToSeconds($('#end').val()), 0);
                var pointA = 0;
                var pointB = 0;
                var pointC = 0;
                var pointD = 0;
                var pointE = 0;
                var pointF = 0;
                try {
                        pointA = Math.max(ToSeconds($('#a').val()), 0);
                        pointB = Math.max(ToSeconds($('#b').val()), 0);
                        pointC = Math.max(ToSeconds($('#c').val()), 0);
                        pointD = Math.max(ToSeconds($('#d').val()), 0);
                        pointE = Math.max(ToSeconds($('#e').val()), 0);
                        pointF = Math.max(ToSeconds($('#f').val()), 0);
                } catch (err) {}

                if (isNaN(pointA))
                        pointA = 0;
                if (isNaN(pointB))
                        pointB = 0;
                if (isNaN(pointC))
                        pointC = 0;
                if (isNaN(pointD))
                        pointD = 0;
                if (isNaN(pointE))
                        pointE = 0;
                if (isNaN(pointF))
                        pointF = 0;
                if (currentID.length != 11)
                ;
                if (isNaN(newStart))
                        newStart = 0;
                if (isNaN(newEnd))
                        newEnd = 0;

                var obj = {};
                var arr = [newStart, pointA, pointB, pointC, pointD, pointE, pointF, newEnd];
                obj[currentID] = arr;
                try {
                        chrome.storage.sync.set(obj);
                } catch (err) {}


                var somethingChecked = (document.getElementById("cb2").checked || document.getElementById("cb4").checked);
                if (somethingChecked) {
                        chrome.storage.sync.get(currentChannelID, function(rez) {
                                if (!document.getElementById("cb4").checked) //end
                                        newEnd = 0; // chose not to set
                                if (!document.getElementById("cb2").checked) //start
                                        newStart = 0; //chose not to set

                                if (rez[currentChannelID] != undefined) { //but if there is an old value
                                        if (!document.getElementById("cb4").checked) //end
                                                newEnd = rez[currentChannelID][1]; //oldend
                                        if (!document.getElementById("cb2").checked) //start
                                                newStart = rez[currentChannelID][0]; //oldstart
                                }
                                var cobj = {};
                                if (!newEnd == 0)
                                        newEnd = parseInt(newEnd - videoLength);
                                cobj[currentChannelID] = [newStart, newEnd];
                                chrome.storage.sync.set(cobj);
                        });

                }


                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                                req: "redraw"
                        }, function(response) {});
                });




                chrome.storage.sync.get("RateCount", function(result) {

                        rates = result["RateCount"];
                        //send
                        if (somethingChecked || (newStart !== start || newEnd !== end) || pointA != 0 || pointB != 0 || pointC != 0 || pointD != 0 || pointE != 0 || pointF != 0)

                                try {
                                        //stats
                                        var saves = 0;
                                        var rates = 0;
                                        chrome.storage.sync.get("SaveCount", function(result) {
                                                saves = result["SaveCount"] + 1;
                                                var toPush = {};
                                                toPush["SaveCount"] = saves;
                                                chrome.storage.sync.set(toPush);


                                        });
                                        views = parseFloat(views.replace(/,/g, ''));
                                        var vScore = Math.floor(Math.log10(views));
                                        var totalTime = newStart + (pointB - pointA) + (pointD - pointC) + (pointF - pointE) + (videoLength - newEnd); //not using max(_,) cuz those SHOULD have a nad rating
                                        var sScore = Math.floor(Math.log2(totalTime));
                                        if (sScore > 10)
                                                sScore = 3;
                                        var score = vScore * 6 + sScore * 4;
                                        score = score + (year - 2016) * 2; //newer videos are more relevent
                                        var userID = "x";
                                        if (newStart != 9999999) {
                                                chrome.storage.sync.get("uidBeta", function(res) {
                                                        userID = res["uidBeta"];
                                                        firebase.database().ref("/times/" + score + " " + currentID).set({
                                                                times: arr,
                                                                uid: userID,
                                                                vid: currentID,
                                                                points: score,
                                                                sCount: saves,
                                                                rCount: rates,
                                                                userTT: tt,
                                                                views: views,
                                                                date: Date()
                                                        });
                                                        if (document.getElementById("cb2").checked || document.getElementById("cb4").checked) {

                                                                firebase.database().ref("/times/CH " + currentChannelID).set({
                                                                        start: newStart,
                                                                        end: newEnd,
                                                                        uid: userID
                                                                });
                                                        }
                                                });
                                        }
                                } catch (err) {}
                });





        };

        document.getElementById('rate').onclick = function() {
                chrome.storage.sync.get("RateCount", function(result) {
                        var rated = result["RateCount"] + 1;
                        var toPush = {};
                        toPush["RateCount"] = rated;
                        chrome.storage.sync.set(toPush);


                });
        };


        document.getElementById('addMid').onclick = function() {
                AddMidRow(0, 0, InnerIndex);
        };



};
