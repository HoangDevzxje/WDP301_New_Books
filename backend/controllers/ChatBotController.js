require('dotenv').config();
const Book = require('../models/Book');

const getSuggestions = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: "Vui lòng cung cấp từ khóa tìm kiếm" });
    }

    const lowerMsg = query.toLowerCase();

    // Xử lý xã giao
    if (["cảm ơn", "thank", "thanks"].some(word => lowerMsg.includes(word))) {
        return res.json({ reply: "Không có gì, rất vui được giúp bạn!" });
    }

    if (["chào", "hi", "hello", "xin chào"].some(word => lowerMsg.includes(word))) {
        return res.json({ reply: "Chào bạn! Bạn muốn tìm sách gì hôm nay?" });
    }

    try {
        // Tìm kiếm sách dựa trên title, author, genre, hoặc description
        const books = await Book.find({
            $and: [
                { "moderation.status": "approved" },
                { status: "active" },
                {
                    $or: [
                        { title: { $regex: lowerMsg, $options: 'i' } },
                        { author: { $regex: lowerMsg, $options: 'i' } },
                        { genre: { $regex: lowerMsg, $options: 'i' } },
                        { description: { $regex: lowerMsg, $options: 'i' } }
                    ]
                }
            ]
        }).populate('categories');

        if (books.length === 0) {
            return res.json({ reply: "Xin lỗi, hiện tại không tìm thấy sách phù hợp với yêu cầu của bạn." });
        }

        // Tạo danh sách sách với thông tin chi tiết
        const bookList = books.map(book => (
            `- Tiêu đềHelen: đề: ${book.title}, Tác giả: ${book.author}, Thể loại: ${book.genre}, Giá: ${book.price}₫, ` +
            `Loại bìa: ${book.cover || 'Không rõ'}, Ngôn ngữ: ${book.language || 'Không rõ'}, ` +
            `Mô tả: ${book.description}, Độ tuổi tối thiểu: ${book.minAge || 'Không giới hạn'}, ` +
            `Số trang: ${book.totalPage || 'Không rõ'}, Kích thước: ${book.dimensions || 'Không rõ'}`
        )).join('\n');

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

        const prompt = `
Danh sách sách hiện có:
${bookList}

Khách hàng hỏi: "${query}"

Dựa trên danh sách, hãy gợi ý 1-3 cuốn sách phù hợp nhất với yêu cầu của khách hàng. 
Nếu không có sách nào phù hợp, hãy trả lời một cách lịch sự và gợi ý khách hàng thử từ khóa khác.
Cung cấp lý do tại sao bạn chọn các sách này (nếu có) và định dạng câu trả lời rõ ràng, dễ đọc.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Xin lỗi, hiện tại tôi chưa tìm được gợi ý phù hợp. Bạn có thể thử từ khóa khác!";

        return res.json({ reply: text });
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        res.status(500).json({ error: "Đã có lỗi xảy ra, vui lòng thử lại sau!" });
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Vui lòng cung cấp hình ảnh" });
        }

        const imageBuffer = req.file.buffer;

        // Phân tích hình ảnh bằng Gemini
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

        const visionResult = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{
                role: "user",
                parts: [
                    {
                        text: "Mô tả nội dung ảnh này, tập trung vào sản phẩm (sách), màu sắc, kiểu dáng, và bất kỳ chi tiết nào có thể liên quan đến sách (ví dụ: bìa cứng/mềm, tiêu đề, tác giả nếu nhìn thấy):"
                    },
                    { inlineData: { mimeType: req.file.mimetype, data: imageBuffer.toString("base64") } }
                ]
            }]
        });

        const imageDescription = visionResult.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Không thể phân tích được nội dung ảnh.";

        // Lấy danh sách sách từ DB
        const books = await Book.find({
            "moderation.status": "approved",
            status: "active"
        }).populate('categories');

        if (!books.length) {
            return res.json({ reply: "Hiện chưa có sách nào để gợi ý." });
        }

        // Tạo danh sách sách với thông tin chi tiết
        const bookList = books.map(book => (
            `- Tiêu đề: ${book.title}, Tác giả: ${book.author}, Thể loại: ${book.genre}, Giá: ${book.price}₫, ` +
            `Loại bìa: ${book.cover || 'Không rõ'}, Ngôn ngữ: ${book.language || 'Không rõ'}, ` +
            `Mô tả: ${book.description}, Độ tuổi tối thiểu: ${book.minAge || 'Không giới hạn'}, ` +
            `Số trang: ${book.totalPage || 'Không rõ'}, Kích thước: ${book.dimensions || 'Không rõ'}`
        )).join('\n');

        const matchPrompt = `
Danh sách sách hiện có:
${bookList}

Mô tả sản phẩm từ hình ảnh: "${imageDescription}"

Hãy gợi ý 1-3 cuốn sách phù hợp nhất với mô tả từ hình ảnh. 
Nếu không có sách nào phù hợp, hãy trả lời lịch sự và gợi ý thử lại với hình ảnh khác.
Cung cấp lý do tại sao bạn chọn các sách này (nếu có) và định dạng câu trả lời rõ ràng, dễ đọc.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: matchPrompt }] }]
        });

        const suggestion = result.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Xin lỗi, không tìm thấy sách phù hợp với hình ảnh. Vui lòng thử lại với hình ảnh khác!";

        res.json({ reply: suggestion });
    } catch (err) {
        console.error("Lỗi khi xử lý ảnh:", err);
        res.status(500).json({ error: "Đã có lỗi xảy ra khi xử lý ảnh, vui lòng thử lại sau!" });
    }
};

module.exports = {
    getSuggestions,
    uploadImage
};