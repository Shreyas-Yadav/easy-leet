import React, { useState, useRef } from "react";
import { AlertCircle, Upload, Send } from "lucide-react";

const MathSolver = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmission = async (data, type) => {
    setIsLoading(true);
    try {
      console.log(`Submitting ${type} data to backend...`);

      const response = await fetch("YOUR_BACKEND_API_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      addMessage(result.response, "assistant");
    } catch (error) {
      console.error("Submission error:", error);
      addMessage(`Error: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      addMessage("Please upload a PDF or image file (JPG/PNG)", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (result) {
          addMessage(
            {
              type: "file",
              name: file.name,
              timestamp: new Date().toISOString(),
            },
            "user"
          );
          await handleSubmission(result, file.type.split("/")[0]);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      addMessage(`Error uploading file: ${error.message}`, "error");
    }
  };

  const addMessage = (content, type) => {
    const newMessage = {
      id: Date.now(),
      content,
      type,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const renderMessage = (message) => {
    if (message.type === "error") {
      return (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={16} />
          <span>{message.content}</span>
        </div>
      );
    }

    if (message.type === "user" && message.content.type === "file") {
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Upload size={16} />
            <span>{message.content.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Uploaded at:{" "}
            {new Date(message.content.timestamp).toLocaleTimeString()}
          </div>
        </div>
      );
    }

    if (
      message.type === "assistant" &&
      typeof message.content === "string" &&
      message.content.includes("```")
    ) {
      const parts = message.content.split(/(```[\s\S]*?```)/);
      return parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3);
          return (
            <div key={index} className="bg-gray-900 rounded-md p-4 my-2">
              <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          );
        }
        return (
          <p key={index} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      });
    }

    return (
      <p className="whitespace-pre-wrap">
        {typeof message.content === "string"
          ? message.content
          : "Invalid message content"}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-100 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] p-4 rounded-lg ${
              message.type === "user"
                ? "bg-blue-500 text-white ml-auto"
                : message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-white shadow"
            }`}
          >
            {renderMessage(message)}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white border-t p-4 space-y-4">
        <div className="flex justify-center gap-4">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Upload size={20} />
            Upload File
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim()) {
              addMessage(inputText, "user");
              handleSubmission(inputText, "text");
              setInputText("");
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            disabled={isLoading || !inputText.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MathSolver;
