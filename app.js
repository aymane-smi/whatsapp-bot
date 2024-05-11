import e from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { MessageSwitcher } from "./utils/whatsapp.js";
import fs from "fs";
import csv from "csv-parser";
import { csvRefresh, smartInsertion } from "./utils/helper.js";
const app = e();
let results = [];
app.use(bodyParser.json());

app.get("/", (req, res)=>{
    res.status(200).send("working");
});

//endpoint for whatsapp hook verification
app.get("/webhook", (req, res)=>{
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];
    if(mode && token){
        if(token === process.env.VERIFY_TOKEN)
            res.status(200).send(challenge);
        else
            res.status(403);
    }
});

//send the recived request and do the neccesary logic
app.post("/webhook", async(req, res)=>{
    const body = req.body;
    if(body.object){
        if(body.entry && body.entry[0]
                      && body.entry[0].changes
                      && body.entry[0].changes[0]
                      && body.entry[0].changes[0].value.messages
                      && body.entry[0].changes[0].value.messages[0]
        ){
            const checker = JSON.stringify(body.entry[0].changes[0].value.messages[0].text.body).replace(/"/g, '').toLowerCase();
            const response = checker.split('-')
            const response_nbr = checker[0].trim();
            const to = body.entry[0].changes[0].value.contacts[0].wa_id;
            if(checker.includes("start")){
                await MessageSwitcher(1, to);
                // data = await smartInsertion(to, "fullName", response[1], results);
                // await csvRefresh(await results);
            }else if(response_nbr == 1){
                await MessageSwitcher(2, to);
                results = await smartInsertion(to, "fullName", response[1], results);
                await csvRefresh(await results);
            }else if(response_nbr == 2){
                await MessageSwitcher(3, to);
                results = await smartInsertion(to, "birthday", response[1], results);
                await csvRefresh(await results);
            }else if(response_nbr == 3){
                await MessageSwitcher(4, to);
                results = await smartInsertion(to, "gender", response[1], results);
                await csvRefresh(await results);
            }else if(response_nbr == 4){
                await MessageSwitcher(5, to);
                results = await smartInsertion(to, "address", response[1], results);
                await csvRefresh(await results);
            }else if(response_nbr == 5){
                await MessageSwitcher(6, to);
                results = await smartInsertion(to, "medicalHistory", response[1], results);
                await csvRefresh(await results);
            }else if(response_nbr == 6){
                results = await smartInsertion(to, "currentMedications", response[1], results);
                await csvRefresh(await results);
                await MessageSwitcher(7, to);
            }else
                await MessageSwitcher(-1, to);
    }}
    res.sendStatus(200);
});

app.listen(3000, async()=>{
    console.log("server start listening at port 3000");
    if(!fs.existsSync("data.csv")){
        const writerCsv = await fs.createWriteStream("data.csv");
        writerCsv.write("phone,fullName,birthday,gender,address,medicalHistory,currentMedications\n");
        writerCsv.end();
    }
    await fs.createReadStream("data.csv").pipe(csv()).on("data", (data)=>results.push(data))
                                               .on("close", ()=>{});

})