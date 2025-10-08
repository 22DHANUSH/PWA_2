

import React, { useState, useRef, useEffect } from "react";
import "./chatbot.css";
import {
  SendOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  SoundOutlined,
  MessageOutlined,
  LoadingOutlined,
  StopOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  Typography,
  Button,
  Input,
  Card,
  Space,
  Spin,
  Avatar,
  message as antdMessage,
} from "antd";
import axios from "axios";
import { getPrimaryImageBySku } from "../Products/products.api";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;

const FloatingChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi there! I’m your smart shopping assistant. How can I help you today?",
    },
  ]);

  console.log(messages)
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  // const [userId] = useState(63);
  const userId = useSelector((state) => state.auth.userId);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_CHATBOT_URL;


  // --- Speech Recognition & Synthesis Setup ---
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        antdMessage.error("Speech recognition error.");
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

    synthRef.current = window.speechSynthesis;
    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      antdMessage.warning(
        "Speech recognition not supported. Try Chrome or Edge."
      );
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const speak = (text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const cleanText = text.replace(/[*_#`>\[\]\(\)]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  const parseResponse = (reply) => {
    try {
      const parsed = JSON.parse(reply);
      if (Array.isArray(parsed)) return { type: "products", data: parsed };
      return { type: "text", data: reply };
    } catch {
      return { type: "text", data: reply };
    }
  };


  const sendMessage = async () => {
  if (!input.trim() || isLoading) return;
  const userMessage = input.trim();
  setInput("");
  setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
  setIsLoading(true);
  stopSpeaking();

  try {
    const response = await axios.post(
      `${API_BASE_URL}chat`,
      { userId, message: userMessage },
      {
        headers: { "Content-Type": "application/json" },
        responseType: "text", // ensures streaming-like responses come as text
      }
    );

    let result = response.data;

    // Some backends send JSON as stringified text; handle both cases safely
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { reply: result };
    }

    const parsedReply = parseResponse(parsed.reply);

    if (parsedReply.type === "text") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: parsedReply.data, type: "text" },
      ]);
      if (voiceEnabled) speak(parsedReply.data);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", type: "products", data: parsedReply.data },
      ]);
      if (voiceEnabled)
        speak(`I found ${parsedReply.data.length} products for you.`);
    }
  } catch (err) {
    console.error(err);
    const errorMsg = "Sorry, I encountered an error. Please try again.";
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: errorMsg, isError: true },
    ]);
    if (voiceEnabled) speak(errorMsg);
  } finally {
    setIsLoading(false);
  }
};
  // --- Product Card ---
  const ProductCard = ({ product }) => {
    const [imgurl, setImgurl] = useState("");

    useEffect(() => {
      const fetchImage = async () => {
        const url = await getPrimaryImageBySku(product.productSkuID); 
        console.log(url)
        setImgurl(url);
      };
      if (product?.productSkuID) fetchImage();
    }, []);

    if (!product) return null;

    return (
      <Card className="product-card" hoverable>
        <div className="product-card-content">
          <img src={imgurl} alt={product.productName||product.productTitle} className="product-image" />
          <div className="product-info">
            <Title
              level={5}
              className="product-title"
              onClick={() =>
                navigate(`/productdetails/${product.productId}/${product.productSkuID}`)
              }
            >
              {product.productName} || {product.productTitle}
            </Title>
            <Text strong style={{ fontSize: 16 }}>${product.productPrice}</Text>
            <br />
            <Text type="secondary">
              {product.productColor} · {product.productSize}
            </Text>
            <br />
            <Text type="secondary">{product.categoryName}</Text>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined/>}
        className="floating-btn"
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Chat Window */}
      {isOpen && (
        <>
          <div className="chat-overlay" onClick={() => setIsOpen(false)} />
          <div className="chatbot-container">
            <div className="chatbot-header">
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: "#1677ff", marginRight: 8 }}
              />
              <Text  strong style={{ color: "#fff" }}>Shopping Assistant</Text>
              <Button type="text" className="close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <Avatar icon={<RobotOutlined />} className="chat-avatar bot-avatar" />
                  )}
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.role === "user" ? (
                      <Text style={{ color: "#fff" }}>{msg.content}</Text>
                    ) : msg.type === "products" ? (
                      msg.data.map((p) => <ProductCard key={p.productId} product={p} />)
                    ) : (
                      <Text>{msg.content}</Text>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar icon={<UserOutlined />} className="chat-avatar user-avatar" />
                  )}
                </div>
              ))}

              {isLoading && (
                <Spin indicator={<LoadingOutlined spin />} tip="Thinking..." className="loading-spin" />
              )}

              {isSpeaking && (
                <Card className="speaking-card">
                  <SoundOutlined style={{ color: "#0c0c0cff" }} /> Speaking...
                  <Button type="link" icon={<StopOutlined />} onClick={stopSpeaking}>
                    Stop
                  </Button>
                </Card>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-footer">
              {isListening && <Text type="danger">Listening...</Text>}
              <Space.Compact style={{ width: "100%" }}>
                <Button
                  onClick={toggleListening}
                  icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
                  danger={isListening}
                  disabled={isLoading}
                />
                <TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about products..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={isLoading}
                />
                <Button
                  type="primary"
                  icon={isLoading ? <LoadingOutlined spin /> : <SendOutlined />}
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                />
              </Space.Compact>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingChatbot;