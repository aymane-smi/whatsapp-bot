import fs from "fs";
export const smartInsertion = async(to, column, value, data)=>{
    //check if the number already exist
    const key = await data.some((row)=>{
        return row.phone == to
    })
    if(key)
        return data.map((row)=>{
                if(to == row.phone)
                    row[column] = value;
                return row;
            });
    else{
        data.push({
            phone: to,
            fullName: "",
            birthday: "",
            gender: "",
            address: "",
            medicalHistory: "",
            currentMedications: ""
        });
        return data.map((row)=>{
            if(to == row.phone)
                row[column] = value;
            return row;
        });
    }
}

export const csvRefresh = async(data)=>{
    const writerCsv = await fs.createWriteStream("data.csv");
    writerCsv.write("phone,fullName,birthday,gender,address,medicalHistory,currentMedications\n");
    data.forEach(row => {
        writerCsv.write(`${row.phone},${row.fullName},${row.birthday},${row.gender},${row.address},${row.medicalHistory},${row.currentMedications}\n`);
    });
    writerCsv.end();
}