import React, { useEffect, useRef, useState } from 'react';
import './Chatbot.css';
import * as ChatBotService from '../../services/ChatbotService';
import { Box, Button, IconButton, Paper, TextField, Typography, Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { Send, Mic, PhotoCamera, Delete, Close, ChatBubbleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const chatBoxRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = "Xin chào! Tôi là trợ lí ảo NewBooks với AI thông minh. Tôi có thể gợi ý sản phẩm phù hợp với mong muốn của bạn. Bạn cần tôi giúp gì không?";
            setMessages([{ sender: 'bot', text: welcomeMessage }]);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        if (input.trim()) {
            setMessages(prev => [...prev, { sender: 'user', text: input }]);

            try {
                const data = { query: input };
                const res = await ChatBotService.chatBot(data);
                const botReply = res.reply || "Bot không trả lời được.";
                const books = res.books || [];
                setMessages(prev => [...prev, { sender: 'bot', text: botReply, books }]);
            } catch {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi khi gọi API.' }]);
            }
        }

        if (selectedImage) {
            const imageUrl = URL.createObjectURL(selectedImage);
            setMessages(prev => [...prev, { sender: 'user', type: 'image', imageUrl }]);

            const formData = new FormData();
            formData.append("image", selectedImage);

            try {
                const res = await ChatBotService.upLoadImage(formData);
                const botReply = res.reply || "Không tìm thấy sản phẩm phù hợp.";
                const books = res.books || [];
                setMessages(prev => [...prev, { sender: 'bot', text: botReply, books }]);
            } catch {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi xử lý ảnh.' }]);
            }

            setSelectedImage(null);
        }

        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleVoiceInput = () => {
        const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            setInput(voiceText);
        };

        recognition.onerror = (event) => {
            console.error("Lỗi nhận dạng giọng nói:", event.error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi nhận dạng giọng nói, vui lòng thử lại.' }]);
        };

        recognition.start();
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedImage(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    return (
        <Box>
            {!isOpen && (
                <IconButton
                    onClick={() => setIsOpen(true)}
                    className="chat-toggle-btn"
                    aria-label="Mở trò chuyện"
                    color="primary"
                    sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
                >
                    <ChatBubbleOutline fontSize="large" />
                </IconButton>
            )}

            {isOpen && (
                <Paper elevation={3} className="chat-popup">
                    <Box className="chat-box">
                        <Box className="chat-header">
                            <Typography variant="h6">AI NewBooks</Typography>
                            <IconButton onClick={() => setIsOpen(false)} aria-label="Đóng">
                                <Close />
                            </IconButton>
                        </Box>
                        <Box className="chat-messages" ref={chatBoxRef}>
                            {messages.map((msg, index) => (
                                <Box
                                    key={index}
                                    className={`msg ${msg.sender}`}
                                    sx={{
                                        backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        margin: '8px',
                                        maxWidth: '80%',
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    {msg.type === 'image' ? (
                                        <img
                                            src={msg.imageUrl}
                                            alt="User uploaded"
                                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                                        />
                                    ) : (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown> // Sử dụng ReactMarkdown để render liên kết
                                    )}
                                    {msg.books && msg.books.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            {msg.books.map((book) => (
                                                <Card key={book._id} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => handleBookClick(book._id)}>
                                                    {book.images && (
                                                        <CardMedia
                                                            component="img"
                                                            height="140"
                                                            image={book.images}
                                                            alt={book.title}
                                                        />
                                                    )}
                                                    <CardContent>
                                                        <Typography variant="h6">{book.title}</Typography>
                                                        <Typography variant="body2">Tác giả: {book.author}</Typography>
                                                        <Typography variant="body2">Thể loại: {book.genre}</Typography>
                                                        <Typography variant="body2">Giá: {book.price}₫</Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Typography variant="caption">Nhấn để xem chi tiết</Typography>
                                                    </CardActions>
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                        <Box className="input-container">
                            <TextField
                                fullWidth
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                variant="outlined"
                                size="small"
                            />
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                            <IconButton
                                component="label"
                                htmlFor="image-upload"
                                title="Gửi ảnh"
                            >
                                <PhotoCamera />
                            </IconButton>
                            <IconButton
                                onClick={handleVoiceInput}
                                title="Ghi âm"
                            >
                                <Mic />
                            </IconButton>
                            <Button
                                className="send-button"
                                variant="contained"
                                onClick={handleSend}
                            >
                                <Send />
                            </Button>
                        </Box>

                        {selectedImage && (
                            <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="preview"
                                    style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px' }}
                                />
                                <IconButton
                                    onClick={handleRemoveImage}
                                    title="Xoá ảnh"
                                    color="error"
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default Chatbot;