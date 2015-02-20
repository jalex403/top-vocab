/* Top 1K Vocab
 * License DWTFYW (Do what the fuck you want)
 * 
 * 
 */

            $(document).bind("mobileinit", function(){
              $.extend(  $.mobile , {
                activeBtnClass: ui-btn-hover,
                loadingMessage: "loading - cargando",
                loadingMessageTextVisible: true
                
              });
            });
            
            var speakUrl = "blank.mp3";
            var speakLinkReady = false;
            
            function ajaxTranslateCallback(response) {
              speakUrl = response;
              speakLinkReady = true;
            }

        $(document).ready(function() {         

           
            var ajaxFlag = false;
            $('#loadingImg').hide();
            var elementsArray;
            var flashcardIndexArray = new Array();
            var playFlag = false;
            var playingDone  = true;   
            var flagChecker = setInterval(serviceFlags, 100);
            
            function serviceFlags(){
                if( typeof serviceFlags.online == 'undefined' ) {
                    serviceFlags.online = false;
                }
                if( typeof serviceFlags.showLoading == 'undefined' ) {
                    serviceFlags.showLoading = false;
                }
                if( typeof serviceFlags.onlineCtr == 'undefined' ) {
                    serviceFlags.onlineCtr = 0;
                }

                
                if (speakLinkReady){
                   $('#audio').prop("src", speakUrl);                
                   $("#audio").trigger('load');
                   $("#audio").trigger('play');
                   speakLinkReady = false;
                   playFlag = false;
                   playingDone = false;
                };
                
                if (((ajaxFlag == true) || (playFlag == true) || !playingDone ) && !serviceFlags.showLoading){
                    serviceFlags.showLoading = true;
                    $('#loadingImg').show()
                }
                
                if ((ajaxFlag == false) && (playFlag == false) && playingDone && serviceFlags.showLoading){
                    serviceFlags.showLoading = false;
                    $('#loadingImg').hide()
                }        
                
              ++serviceFlags.onlineCtr;
              if(serviceFlags.onlineCtr > 9){
                  serviceFlags.onlineCtr = 0;
                  serviceFlags.online = navigator.onLine;
              }
                
              if (serviceFlags.online != navigator.onLine){
                    serviceFlags.online = navigator.onLine;
                    if (serviceFlags.online) {
                          $(".needConnection").prop("disabled", false);
                          $("#conStatus").html(" ");
                          $("#wordGrid .grid-link").addClass('e-word');
                          $("#wordGrid .grid-link").css('color',"#2980B9");
                        } else {
                          $(".needConnection").prop("disabled", true);
                          $("#conStatus").html("Offline! - Sin Conexion!");
                          $("#wordGrid .grid-link").removeClass('e-word');
                          $("#wordGrid .grid-link").css('color','');
                        }
                }    

            }
            

            function getToken() {
                if( typeof getToken.tokenExpires == 'undefined' ) {
                    getToken.tokenExpires = 0;
                }
                if( typeof getToken.g_token == 'undefined' ) {
                    getToken.g_token = '';
                }
              var currentTime = new Date();
                
              if ((currentTime.getTime()/1000) > getToken.tokenExpires){  
                  var requestStr = "token.php";               
                  $.ajax({
                    url: requestStr,
                    type: "GET",
                    cache: true,
                    dataType: 'json',
                    success: function (data) {
                        getToken.g_token = data.access_token;
                        getToken.tokenExpires = Number((currentTime.getTime()/1000 + 570));
                    }             
                  });
              }
              return getToken.g_token ;
            }
            

              function getSpeakUrl(word) {
              var p = new Object;
              p.text = word;
              p.format = "audio/mp3";
              p.language = "en";
              p.options = "MinSize";
              p.appId = "Bearer " + getToken();

              var requestStr = "http://api.microsofttranslator.com/V2/Ajax.svc/Speak";

              $.ajax({
                url: requestStr,
                type: "GET",
                data: p,
                dataType: 'jsonp',           
                jsonp: 'oncomplete',
                jsonpCallback:'ajaxTranslateCallback',
                cache: true,
                async: false
              });
            }         
               
            $.ajaxSetup({   
                beforeSend: function() {
//                     $('#loadingImg').show();
                     ajaxFlag = true;
                  },
                  complete: function(){
//                     $('#loadingImg').hide();
                     ajaxFlag = false;
                  },
                  error: function(jqXHR, textStatus, errorThrown){ 
                      $('#loadingImg').hide();
                      $("#wordGrid .e-word").css("background-color", '');
                      alert("An error occured: " + textStatus + " " + errorThrown);
                  },
                async: false
                });
        
            $("#btnPlay").on("click", function(){
                 
                var word = $("#word").val();
                //check for null
                if (!word){
                   word = "enter word";
                };
                speakWord(word);
             });
             
            
             
            $("#btnWords").click(function(){
                 fillWordGrid();
                $.mobile.changePage($("#word_list"), "none");
            });
            

            
            function firstPlay(){
                if( typeof firstPlay.initPlay == 'undefined' ) {
                    firstPlay.initPlay = false;
                }
                if (!firstPlay.initPlay) {
                    $("#audio").trigger('load');
                    $("#audio").trigger('play');
                    $("#audio").trigger('pause');
                }
            }
        
            function speakWord(word){
                if( typeof speakWord.currentWord == 'undefined' ) {
                    speakWord.currentWord = "test";
                }
                var fullLink;
                var string;
                var word1;
                firstPlay();
                playFlag = true;

               if (speakWord.currentWord == word){
                    $("#audio").trigger('load');
                    $("#audio").trigger('play');
                    playFlag = false;
                    playingDone = false;
                    return;
               }
               speakWord.currentWord = word; 
               if ($('#voiceEngine').val() == "bing"){
                   getSpeakUrl(speakWord.currentWord);               
                   fullLink = speakUrl;
                   return;
               }else if ($('#voiceEngine').val() == "voicerss"){
                   fullLink = "http://api.voicerss.org/?&key=ab912f6a48934df8a324ffdee99c70db&hl=en-us&src=" + encodeURI(speakWord.currentWord);
               }else {
//               means ($('#voiceEngine').val() == "tts-api"){
                    string = speakWord.currentWord.split(" ",1);
                    word1 = (string[0]);
                    fullLink = "http://tts-api.com/tts.mp3?q=" + encodeURI(word1);
               }
                    $('#audio').prop("src", fullLink);
                    $("#audio").trigger('load');
                    $("#audio").trigger('play');
                    playFlag = false;
                    playingDone = false;               
            };
            
        $("#wordGrid").on("click",".e-word",function(){
            speakWord($(this).text());
          });

        $("#audio").on("ended",function(){
          playingDone = true;
        });

        function loadXMLDoc (){ 
            if( typeof loadXMLDoc.xmlIsLoaded == 'undefined' ) {
                    loadXMLDoc.xmlIsLoaded = false;
            }   
            if( typeof loadXMLDoc.xml == 'undefined' ) {
                    loadXMLDoc.xml = " ";
            }   
            
            if (loadXMLDoc.xmlIsLoaded){
                return;
            }
            $.ajax({
                    type: "GET",
                    async: false,
                    url: "TopEnglishVocab.xml",
                    dataType: "text",
                    success: function(data) {
                        loadXMLDoc.xml=data;
                        loadXMLDoc.xmlIsLoaded = true;
                    }
            });
           var parser = new DOMParser();
           var xmlDoc = parser.parseFromString(loadXMLDoc.xml , "text/xml");

           elementsArray = xmlDoc.documentElement.getElementsByTagName('word');

           
        }
        
        window.fillWordGrid = function(){
           loadXMLDoc();
           if (($('#rankGroup').val()) < 1200){
               var startPointer = $('#rankGroup').val()-200;
               var arrayLength = $('#rankGroup').val();
           } else {
               var startPointer = 0;
               var arrayLength = 1000;
           }   
//           var output="<div class='ui-block-a ui-bar-a' ><span>Rango: Spanish</span></div><div class='ui-block-b ui-bar-a' ><span >Ingles</span></div>";
           var output="<thead><tr class='ui-bar-a'><th style='width:18%'>Rgo.</th><th>Español</th><th>Ingles</th></tr></thead>";
           output += "<tbody>";
           for(var i=startPointer; i < arrayLength; i++){
                var rank = elementsArray[i].getElementsByTagName('rank')[0].firstChild.nodeValue;
                var spanish = elementsArray[i].getElementsByTagName('spanish')[0].firstChild.nodeValue;
                var english = elementsArray[i].getElementsByTagName('english')[0].firstChild.nodeValue;
                
//                output += "<div class='ui-block-a' style='border:1px solid lightgray;'><span>"+ rank +":<br>  "+ spanish +"</span></div>";
//                
//                if (navigator.onLine) {
//                    output += "<div class='ui-block-b e-word grid-link'  style='border:1px solid lightgray; color:#2980B9;'><span><br>"+ english +"</span></div>" ;
//                } else {
//                   output += "<div class='ui-block-b ui-link'  style='border:1px solid lightgray;'><span><br>"+ english +"</span></div>" ;
//               }
                output += "<tr><td style='border:1px solid lightgray;'>" + rank + "</td><td style='border:1px solid lightgray;'>" + spanish + "</td>";
                
                if (navigator.onLine) {
                    output += "<td class='e-word grid-link'  style='border:1px solid lightgray; color:#2980B9;'>" + english + "</td></tr>";
                } else {
                   output += "<td class=' grid-link'  style='border:1px solid lightgray; color:#2980B9;'>" + english + "</td></tr>";
               }

           }
           output += "</tbody>";
//           console.log(output);
            $( "#wordGrid" ).html( output );
        };
        
                
        $("#btnFcards").click(function(){
            loadFlashcards();            
         });
         
        window.loadFlashcards = function(){
            loadXMLDoc(); 
            fillFlashcardIndexArray();
            switchFlashcard("next");
            $("body").pagecontainer("change", "#englishflashcard");
            
         };
         
         function switchFlashcard(direction){
             if( typeof switchFlashcard.flashcardIndex == 'undefined' ) {
                    switchFlashcard.flashcardIndex = 0;
            }
            if( typeof switchFlashcard.shiftedIndex == 'undefined' ) {
                    switchFlashcard.shiftedIndex = 0;
            }
            if( typeof switchFlashcard.allWordsIndex == 'undefined' ) {
                    switchFlashcard.allWordsIndex = 1;
            }
             
             
             if (direction === "next"){
                 if (switchFlashcard.flashcardIndex === 199){
                     switchFlashcard.flashcardIndex = 0;
                 }else{
                     switchFlashcard.flashcardIndex += 1;
                 }                     
             }
             if (direction === "previous"){
                 if (switchFlashcard.flashcardIndex === 0){
                     switchFlashcard.flashcardIndex = 199;
                 }else{
                     switchFlashcard.flashcardIndex -=1;
                 }                     
             }
             if (($('#rankGroup').val()) > 1000){
                 ++switchFlashcard.allWordsIndex;
                 if(switchFlashcard.allWordsIndex > 5 ){
                    switchFlashcard.allWordsIndex = 1;
                }
                switchFlashcard.shiftedIndex = flashcardIndexArray[switchFlashcard.flashcardIndex]  + ((200 * switchFlashcard.allWordsIndex) - 200);
             
             } else {
                 switchFlashcard.shiftedIndex = flashcardIndexArray[switchFlashcard.flashcardIndex]  + Number($('#rankGroup').val()) - 200;
             }
             var spanish = elementsArray[switchFlashcard.shiftedIndex].getElementsByTagName('spanish')[0].firstChild.nodeValue;
             var english = elementsArray[switchFlashcard.shiftedIndex].getElementsByTagName('english')[0].firstChild.nodeValue;
             $( "#englishWord" ).html( english );
             $( "#spanishWord" ).html( spanish );
         }
         
        $("#btnPlayEng").on("click", function(){               
//                language = "en-us";
                var word = $( "#englishWord" ).html();
                //Play Audio                
                speakWord(word);
                
         });
         
        $(document).on("pageshow","#englishflashcard",function(){
          $( "#englishWord" ).css('visibility','visible');
          $( "#spanishWord" ).css('visibility','visible');
        });
        $(document).on("pageshow","#spanishflashcard",function(){
          $( "#englishWord" ).css('visibility','visible');
          $( "#spanishWord" ).css('visibility','visible');
        });
     
        
        $("#btnPrev").on("click", function(){
            $( "#englishWord" ).css('visibility','hidden');
            $( "#spanishWord" ).css('visibility','hidden');
            $("body").pagecontainer("change", "#englishflashcard",{ transition:"slidedown", changeHash:"false"});
            switchFlashcard("previous");
             
        });
        
        $("#btnNext").on("click", function(){
//            switchFlashcard("next");
            $( "#englishWord" ).css('visibility','hidden');
            $( "#spanishWord" ).css('visibility','hidden');
            $("body").pagecontainer("change", "#englishflashcard",{ transition:"slideup", changeHash:"false"});
            switchFlashcard("next");
        });
        
        $("#btnEPrev").on("click", function(){   
            $( "#englishWord" ).css('visibility','hidden');
            $( "#spanishWord" ).css('visibility','hidden');
            $("body").pagecontainer("change", "#englishflashcard",{ transition:"slidedown", allowSamePageTransition:"true"});
            switchFlashcard("previous");
        });
        
        $("#btnENext").on("click", function(){
            $( "#englishWord" ).css('visibility','hidden');
            $( "#spanishWord" ).css('visibility','hidden');
            $("body").pagecontainer("change", "#englishflashcard",{ transition:"slideup", allowSamePageTransition:"true" });
            switchFlashcard("next");
        });
        
        $(".btnFlip").on("click", function(){
            var activePage =$("body").pagecontainer("getActivePage").prop( 'id' );
            if(activePage === "englishflashcard"){
                $("body").pagecontainer("change", "#spanishflashcard",{ transition:"flip", changeHash:"false"});
            } 
            if(activePage === "spanishflashcard"){
                $("body").pagecontainer("change", "#englishflashcard",{ transition:"flip", changeHash:"false"});
            } 
        });
        
        function fillFlashcardIndexArray(){
            if( typeof fillFlashcardIndexArray.arrayIsLoaded == 'undefined' ) {
                    fillFlashcardIndexArray.arrayIsLoaded = false;
            }
            if (fillFlashcardIndexArray.arrayIsLoaded){
                return;
            }
            for (var i = 0; i < 200; i++){
                flashcardIndexArray[i] = i + 1;
            }
            shuffleArray(flashcardIndexArray);
        }
   
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }    
 
         $('.activeHighlight').on('vmousedown', function() {
            $(this).addClass('ui-btn-active');
        });

         $('#wordGrid').on('vmousedown',".e-word", function() {
            $(this).css("background-color", "#E74C3C");
        });

        $(document).on('vmouseup', function() {
            $('.activeHighlight').removeClass('ui-btn-active');
            $("#wordGrid .e-word").css("background-color", '');
        });  
      
        
});                        
      
