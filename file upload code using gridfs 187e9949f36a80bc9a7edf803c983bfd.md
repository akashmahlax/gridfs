# file upload code using gridfs

# gridfs

### install nextjs in your project

```jsx
npx create-next-app ./

```

## install dependencies

```jsx
npm i mongodb ; npm i 
```

### create lib folder

```jsx
cd src ; mkdir lib ; cd lib ; ni mongoose.ts ; cd .. ; cd .. ;  ni .env.local 
```

### Add below code to connect mongodb in mongoose.ts file of lib folder

```jsx
import { MongoClient } from "mongodb"

// MONGODB_URI=mongodb+srv://akashmahla:5MumP19NdVohkbx2@cluster0.hlo2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//this is mongodb uri

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

```

Add MONGO_URI in env.local file 

```jsx
MONGODB_URI=mongodb+srv://akashmahla:5MumP19NdVohkbx2@cluster0.hlo2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## **Now mongodb is connected**

## Add route to handle request

1. create folder upload in app folder of src folder
2. create file route.ts in upload folder

```jsx
cd src ; cd app ;mkdir api ; cd api ; mkdir upload ; cd upload ; ni route.ts
```

Add the code to handle request for file upload

…later on we will add code and cut this line 

```jsx
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
```

## Note : no need to install gridfs additionaly because it comes with mongodb by default when we install mongodb through

olnpm i mongodb

# add frondend code

```jsx
"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setMessage(result.message || result.error);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <form onSubmit={handleUpload} className="w-full max-w-md">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full border p-2 mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

```