import axios from "axios";
import "dotenv/config";

const MessageTemplate = async(templateName, to)=>{
    return await axios.post(`https://graph.facebook.com/v19.0/${process.env.ID_PHONE}/messages`, { 
        messaging_product: "whatsapp", 
        to, 
        type: "template", 
        template: { 
            name: templateName, 
            language: {code: "en" } }

        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });
};

export const MessageSwitcher = async(id, to)=>{
    switch(parseInt(id)){
        case 1:
            await MessageTemplate("full_name", to);
            break;
        case 2:
            await MessageTemplate("birthday", to);
            break;
        case 3:
            await MessageTemplate("gender", to);
            break;
        case 4:
            await MessageTemplate("address", to);
            break;
        case 5:
            await MessageTemplate("history", to);
            break;
        case 6:
            await MessageTemplate("medication", to);
            break;
        case 7:
            await MessageTemplate("greeting", to);
            break;
        default:
            await MessageTemplate("helper", to);
            break;
    }
}