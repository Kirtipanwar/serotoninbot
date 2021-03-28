let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let PDFDocument = require("pdfkit");
let url = "https://github.com/topics";
request(url, cb);
function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        // console.log(html);
        extractData(html);
    }
}
function extractData(html) {
    let selTool = cheerio.load(html);
    let anchors = selTool
        (".no-underline.d-flex.flex-column.flex-justify-center");
    for (let i = 0; i < anchors.length; i++) {
        let link = selTool(anchors[i]).attr("href");
        // console.log(link);
        let fullLink = "https://github.com" + link;
        extractRepodata(fullLink)
    }
}
function extractRepodata(fullLink) {
    request(fullLink, cb);
    function cb(err, response, html) {
        if (err) {
            console.log(err);
        } else {
            getRepoLinks(html);
        }
    }
}
function getRepoLinks(html) {
    let selTool = cheerio.load(html);
    let topicNameElem = selTool(".h1-mktg");
    let repolinks = selTool("a.text-bold");
    //console.log(topicNameElem.text());
    let topicName = topicNameElem.text().trim();
    dirCreater(topicName);
    for (let i = 0; i < 8; i++) {
        let repoPageLink = selTool(repolinks[i]).attr("href");
        let repoName = repoPageLink.split("/").pop();
        repoName = repoName.trim();
        //console.log(repoName);
        //createFile(repoName, topicName);
        //console.log(repoPageLink)
        let fullRepoLink = "https://github.com"+repoPageLink+"/issues";
        getIssues(repoName, topicName, fullRepoLink);
    }
    console.log("`````````````````````````");
}
function getIssues(repoName, topicName, repoPageLink){
    request(repoPageLink, cb);
    function cb(error, response, html){
        if(error){
            //if(response.statusCode == 404){
                //console.log("NO ISSUES PAGE FOUND");
            //}else{
                console.log(error)
            }
        //}else{
            extractIssues(html, repoName, topicName);
        //}
    }
}
function extractIssues(html, repoName, topicName){
    let selTool = cheerio.load(html);
    let IssuesAnchor = selTool("a.link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let Array = [];
    for(let i=0; i<IssuesAnchor.length; i++){
        let name = selectorTool(IssuesAnchor[i]).text();
        let Link = selectorTool(IssuesAnchor[i]).attr("href");
        Array.push({
            "Name" : name,
            "Link" : "https://github.com"+Link
        })
    }
    let filePath = path.join(__dirname, topicName, repoName + ".pdf");
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(JSON.stringify(Array));
    pdfDoc.end();
    //fs.writeFileSync(filePath, JSON.stringify(Array));
    //file write
    //console.table(Array);
}
function dirCreater(topicName) {
    let pathOfFolder = path.join(__dirname, topicName);
    if (fs.existsSync(pathOfFolder) == false) {
        fs.mkdirSync(pathOfFolder);
    }
}

function createFile(repoName, topicName) {
    let pathofFile = path.join(__dirname, topicName, repoName + ".json");
    if (fs.existsSync(pathofFile) == false) {
        let createStream = fs.createWriteStream(pathofFile);
        createStream.end();
    }
}