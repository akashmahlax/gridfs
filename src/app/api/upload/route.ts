// app/api/upload/route.js
import clientPromise from "@/lib/mongoose";
import { type NextRequest, NextResponse } from "next/server"
import { GridFSBucket } from "mongodb";

export async function POST( request: NextRequest) {
   try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
        return NextResponse.json({ error: "No file received" }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const client = await clientPromise;
      const db = client.db()
      const bucket = new GridFSBucket(db)
   
        
    

        const uploadStream = bucket.openUploadStream(file.name); // upload file to mongodb
        const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
    });  //uploadpromise is used to wait for the file to be uploaded to mongodb

        uploadStream.end(buffer);  //end the upload stream
        await uploadPromise;  //wait for the file to be uploaded to mongodb

        return NextResponse.json({
            message: "File uploaded successfully",
            fileId: uploadStream.id.toString(),
          })


   }catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
    
   }
    
}