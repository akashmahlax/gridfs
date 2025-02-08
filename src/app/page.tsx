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
