function setup() {
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    // location of XML Bible files, must be on same web server
    // that hosts this web page to avoid Cross-Domain request restrictions
    biblePath = "/class/csc3004/XMLBible/kjv_by_book/";
    lexiconPath = "/class/csc3004/XMLBible/";
    lexiconVerses = "/class/csc3004/XMLBible/bible_refs_of_strongs_numbers/";

    lexiconDiv = document.getElementById("lexiconDiv");
    verseDiv = document.getElementById("verseDiv");

    //used to highlight verse HTML
    currentStrongs = "H-1";
}


function displayFormInputs(book, chapter, verse, num_verses) {
    document.getElementById("book").value = book;
    document.getElementById("chapter").value = chapter;
    document.getElementById("verse").value = verse;
    document.getElementById("num_verses").value = num_verses;
    getResponse();
}

function displayLexiconVerses(lexiconID) {

    var isHebrew = lexiconID.charAt(0) == 'H';
    var path = "bible_refs_by_strongs_num_";

    var XMLLexicon = lexiconVerses + path + (isHebrew ? "ot.xml" : "nt.xml");
    xmlhttp.open("GET", XMLLexicon, false);
    xmlhttp.send();
    var response = xmlhttp.responseXML;

    var xmlNodes = response.children[0].querySelectorAll('[number="' + lexiconID.substr(1) + '"]')[0].childNodes;

    var xmlString = "";

    for (var i = 0; i < xmlNodes.length; i++) {
        var currentNode = xmlNodes[i];
        var bookNumber = currentNode.getAttribute("b");
        var book = document.getElementById("book").options[bookNumber-1].text;
        var chapter = currentNode.getAttribute("ch");
        var verse = currentNode.getAttribute("v");

        xmlString += "<p class='lexiconRef' onclick=\"currentStrongs = '" + lexiconID + "'; displayFormInputs(" + bookNumber + "," + chapter + "," + verse + ",1);  \">" + book + " " + chapter + ":" + verse + "</p>";
    }

    //Clears out the div
    while (verseDiv.firstChild) {
        verseDiv.removeChild(verseDiv.firstChild);
    }

    //return to top
    verseDiv.scrollTop = 0;

    verseDiv.innerHTML = xmlString;
}
function displayLexicon(lexiconID) {

    //Clear out div for Lexicon
    while (lexiconDiv.firstChild) {
        lexiconDiv.removeChild(lexiconDiv.firstChild);
    }

    var letterID = lexiconID.replace('*', '');
    var isHeb = false;

    //First character identifies: H or G
    if (letterID.charAt(0) == 'H') 
        isHeb = true;
    if (letterID.charAt(0) == 'G') 
        isHeb = false;

    //Now that we've used the lexiconID to determine Hebrew/Greek, replace letters with empty space (remove letter)
    lexiconID = letterID.substr(1);

    //Construct a string using isHeb flag to determine if greek or hebrew; cut ID down to get a proper index.
    lexiconLanguage = (isHeb ? "heb_strongs" : "greek_strongs") + "/" + (isHeb ? "heb" : "grk") + Math.floor((lexiconID-1)/100) + ".xml";
    //Append the completed lexiconLanguage string to path, set XMLLexicon equal to this
    var XMLLexicon = lexiconPath + lexiconLanguage;
    xmlhttp.open("GET", XMLLexicon, false);
    xmlhttp.send();


    var response = xmlhttp.responseXML;
    ////We will need the H or G back, use isHeb flag from earlier - then we can get the element by this ID
    //var lexID = (isHeb ? "H" : "G") + lexiconID;

    var node = response.getElementById(letterID);

    //Title
    var titleNode = document.createElement("H1");
    titleNode.innerHTML = node.getElementsByTagName("title")[0].innerHTML;
    lexiconDiv.appendChild(titleNode);

    //ID
    var idNode = document.createElement("H4");
    idNode.innerHTML = node.getElementsByTagName("strong_id")[0].innerHTML;
    lexiconDiv.appendChild(idNode);

    //Transliteration
    var translitNode = document.createElement("H3");
    translitNode.innerHTML = node.getElementsByTagName("transliteration")[0].innerHTML;
    lexiconDiv.appendChild(translitNode);

    //Pronunciation
    var pronunciationNode = document.createElement("H4");
    //Wrap in italix
    pronunciationNode.innerHTML = "<i>" + node.getElementsByTagName("pronunciation")[0].children[0].innerHTML + "</i>";
    lexiconDiv.appendChild(pronunciationNode);

    //Description
    var descriptionNode = document.createElement("P");
    var descriptionXMLNode = node.getElementsByTagName("description")[0];

    var descriptionString = "";

    //for every child
    for (k = 0; k < descriptionXMLNode.childNodes.length; k++) {
        var currentNode = descriptionXMLNode.childNodes[k];

        //If we find text nodes, add the text to string
        if (currentNode.nodeType == Node.TEXT_NODE) {
            descriptionString += currentNode.nodeValue;
        }

        if (currentNode.nodeType == Node.ELEMENT_NODE) {
            //Make links clickable
            if (currentNode.nodeName == "link") {
                descriptionString += getStrongsLexicon(currentNode);
            }
            //Otherwise just use the existing XML tags
            else descriptionString += currentNode.outerHTML;
        }
    }

    descriptionNode.innerHTML = descriptionString;
    //Now the final child is ready to be appended
    lexiconDiv.appendChild(descriptionNode);

    //Display list of references
    displayLexiconVerses(letterID);
}

function getResponse() {
    //Start by reading the input and storing it in vars
    var isStrongs = document.getElementById('useStrongs').checked;
    var Book = document.getElementById('book').value;
    var Chapter = document.getElementById('chapter').value;
    var Verse = parseInt(document.getElementById('verse').value);
    var NumberOfVerses = parseInt(document.getElementById('num_verses').value);

    var XMLBook = biblePath + Book + ".xml";
    xmlhttp.open("GET",XMLBook,false);
    xmlhttp.send();
    xmlDoc = xmlhttp.responseXML;

    var responseString = " ";

    var initialization = false;
    //initialize current chapter, current verse, and previous chapter (starts at -1)
    var currentChapter = Chapter, currentVerse = Verse, previousChapter = -1;

    //loop through for every verse
    for (var i = 0; i < NumberOfVerses; i++) {

        try {
            //grab next verse and append it to response
            verseText = getVerse(currentChapter, currentVerse, isStrongs);

            //chapter header
            if (previousChapter != currentChapter) {
                responseString += "<h3>" + xmlDoc.getElementsByTagName("book")[0].getAttribute("name") + " " + currentChapter + "</h3>";
                previousChapter = currentChapter;
            }

            responseString += "<p>" + verseText + "</p>";
            currentVerse++;

            //if we get here on the i = 0 run, initialized successfully
            if (i == 0) {
                initialization = true;
            }
        }
        //Catch error and determine what caused the error
        catch (error) {
            //Fails to initialize and has errors
            if (!initialization) {
                if (error == "NO BOOK") {
                    responseString += "<b><i> No book found: " + Book + "</i></b>";
                }
                else if (error == "NO CHAPTER") {
                   responseString += "<b><i> No chapter found: " + Chapter + "</i></b>";
                }
                else if (error == "NO VERSE") {
                    responseString += "<b><i> No verse found: " + Verse + "</i></b>";
                }
                break;
            }
            //We've either come to the end of a book or chapter
            else {
                if (error == "NO BOOK") {
                    responseString += "<b><i> End of Book </i></b>";
                }
                else if (error == "NO CHAPTER") {
                    responseString += "<b><i> End of Book </i></b>";
                    break;
                }
                //If we initialize but run out of verses, increment the chapter, reset verse, and continue
                else if (error == "NO VERSE") {
                    currentChapter++;
                    currentVerse = 1;
                    i--;
                    continue;
                }
            }
        }
    }
    //Return to top
    document.all.responseArea.scrollTop = 0;
    document.all.responseArea.innerHTML = responseString;
}

function getVerse(Chapter, Verse, isStrongs) {
    var verseOutput = "";

    //Check that chapter exists
    var chap = xmlDoc.getElementsByTagName("chapter")[Chapter - 1];
    if (chap == null) {
        throw "NO CHAPTER";
    }

    var ver = chap.getElementsByTagName("verse")[Verse - 1];
    if (ver == null) {
        throw "NO VERSE";
    }

    verseOutput += ver.getAttribute("number");
    verseOutput += " ";

    //prevents clunky spacing issue when a previous entry was lexicon strongs
    //add space if not using strongs, there is no punctuation, and strongs was just used
    var previousUsedStrongs = false;

    for (k = 0; k < ver.childNodes.length; k++) {

        previousUsedStrongs = false;
        var currentNode = ver.childNodes[k];

        //If a text node, append text
        if (currentNode.nodeType == Node.TEXT_NODE) {
            var currentHasPunctuation = /[,.?!\-:;'"]/.test(ver.childNodes[k].nodeValue);
            if (!isStrongs && !currentHasPunctuation && previousUsedStrongs) {
                verseOutput += " ";
            }
            verseOutput += ver.childNodes[k].nodeValue;
            verseOutput += " ";
        }

        //If a tag node
        if (currentNode.nodeType == Node.ELEMENT_NODE) {
            //Vary behavior depending on tag
            if (currentNode.nodeName == "em") {
                verseOutput += "<i>";
                verseOutput += currentNode.childNodes[0].nodeValue;
                verseOutput += "</i>";
            }

            if (currentNode.nodeName == "strongs") {
                previousUsedStrongs = true;
                if (currentNode.childNodes.length > 0) {
                    //if child node has a value check to see if ID - first letter matches. If so highlight, if not add
                    if (hasMatchingID(currentNode, currentStrongs.substr(1))) {
                        verseOutput += "<span style='background: yellow;'>";
                        verseOutput += currentNode.childNodes[0].nodeValue;
                        verseOutput += "</span>";
                    }
                    else {
                        verseOutput += currentNode.childNodes[0].nodeValue;
                    }
                }
                if (isStrongs) {
                    verseOutput += getStrongsFormat(currentNode);
                }
            }
        }

    }
    //reset global flag
    currentStrongs = "H-1";

    return (verseOutput);
}

function hasMatchingID(node, id) {
    var ID = "";
    var letter = "";

    if (node.hasAttribute("hebrew")) {
        ID = "hebrew";
        letter = "H";
    }

    else if (node.hasAttribute("greek")) {
        ID = "greek";
        letter = "G";
    }

    else if (node.hasAttribute("number")) {
        ID = "number";
        letter = "N";
    }
    else {
        return false;
    }
    //replace with nothing (remove)
    var groupOfIDs = node.getAttribute(ID).replace('*', '');
    //split into a list using space as separator 
    var splitGroup = groupOfIDs.split(" ");

    //if a match is found, return true, else default to false
    for (var i = 0; i < splitGroup.length; i++) {
        if (splitGroup[i] == ID) {
            return true;
        }
    }
    return false;
}

var HEBREW_COLOR = "#87C232";
var GREEK_COLOR = "cyan";
var NUMBER_COLOR = "white";

//Use similar format to above function
function getStrongsFormat(node) {

    var ID = "";
    var color = "";
    var letter = ""

    if (node.hasAttribute("hebrew")) {
        ID = "hebrew";
        letter = "H";
        color = HEBREW_COLOR;
    }

    if (node.hasAttribute("greek")) {
        ID = "greek";
        letter = "G";
        color = GREEK_COLOR;
    }

    if (node.hasAttribute("number")) {
        ID = "number";
        letter = "N";
        color = NUMBER_COLOR;
    }

    var groupOfIDs = node.getAttribute(ID);

    var returnString = "";

    //split into a list using space as separator 
    var splitGroup = groupOfIDs.split(" ");

    for (var i = 0; i < splitGroup.length; i++) {
        returnString += "<i><font-size=2; color=" + color + "><sub class='strongsNumbers' onclick=\"displayLexicon('" + letter + splitGroup[i] + "')\">";
        returnString += splitGroup[i];
        returnString += "</sub></font></i> ";
    }
    return returnString;
}

function getStrongsLexicon(node) {

    var color;
    if (node.innerHTML.charAt(0) == 'H') {
        color = HEBREW_COLOR;
    }
    else if (node.innerHTML.charAt(0) == 'G') {
        color = GREEK_COLOR;
    }
    else if (node.innerHTML.charAt(0) == 'N') {
        color = NUMBER_COLOR;
    }

    var groupOfIDs = node.innerHTML;
    var returnString = "";
    var splitGroup = groupOfIDs.split(" ");

    for (var i = 0; i < splitGroup.length; i++) {
        returnString += "<i onclick=\"displayLexicon('" + splitGroup[i] + "'); \"><font color=" + color + " class='strongsNumbers'>";
        returnString += splitGroup[i];
        returnString += "</font></i>";
    }

    return returnString;
}