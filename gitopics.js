let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
const { createInflate } = require("node:zlib");
const { testElement } = require("domutils");
console.log("before");
request("https://github.com/topics",cb);
function cb(error, response, html){
    if(error){
        console.log(error);
    } else{
        extracthtml(html);
    }
}
function extracthtml(html){
    let selectorTool = cheerio.load(html);
    //let tArr = selectorTool("col-12.col-sm.col-md-4.mb-4 a");
    let a = selectorTool(".no-underline.d-flex.flex-column.flex-justify-center");

    for(let i=0; i<a.length; i++){
        let link = selectorTool(a[i]).attr("href");
        let fullLink = "https://github.com" + link;
        repoPage(fullLink);
    }
}
function repoPage(fullLink){
    request(fullLink, cb);
    function cb(error, response, html){
        if(error){
            console.log(error);
        }else{
            getRepoLinks(html);
        }
    }
}
function getRepoLinks(html){
    let selectorTool = cheerio.load(html);
    let tElements = selectorTool(".h1-mktg");
    let arr = selectorTool("a.text-bold");
    console.log(tElements.text());
    let topicName = tElements.text().trim();
    createdirectory(topicName);
    for(let i=0; i<8; i++){
        let link = selectorTool(arr[i]).attr("href");
        let repoName = link.split("/").pop();
        repoName = repoName.trim();
        //console.log(link);
        console.log(repoName);
        createFile(repoName, topicName);
        let fullrepolink = "https://github.com"+link+"/issues";

        getIssues(repoName, topicName, fullrepolink);
    }
    console.log("-------------------------------------------------");
}
function getIssues(repoName, topicName, fulrepolink){
    request(link, cb);
    function cb(error, response, html){
        if(error){
            if(response.statusCode == 404){
                console.log("NO ISSUES PAGE FOUND!");
            }else{
                console.log(error);
            }
        }else{
            extractIssues(html, repoName, topicName);
        }
    }
}
function extractIssues(html, repoName, topicName){
    let selectorTool = cheerio.load(html);
    let issuesA = selectorTool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let Array = [];
    for(let i=0; i<issuesA.length; i++){
        let name = selectorTool(issuesA[i]).text();
        let Link = selectorTool(issuesA[i]).attr("href");
        Array.push({
            "Name" : name,
            "Link" : "https://github.com"+Link
        })
    }
    let filePath = path.join(__dirname, topicName, repoName + ".json");
    fs.writeFileSync();
    //console.table(Array);
}
function createdirectory(topicName){
    let pathoffolder = path.join(__dirname, topicName);
    if(fs.existsSync(pathoffolder)== false){
       fs.mkdirSync(pathoffolder);
    }
}
function createFile(repoName, topicName){
    let pathoffile = path.join(__dirname, topicName, repoName + ".json");
    if(fs.existsSync(pathoffile)==false){
        let createStream = fs.createWriteStream(pathoffile);
        createStream.end();

    }
}
console.log("after");