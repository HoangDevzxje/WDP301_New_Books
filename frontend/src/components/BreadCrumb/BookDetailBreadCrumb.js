import React, { useEffect, useState } from "react";
import { Typography, Container, Breadcrumbs, Box } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function BookDetailBreadCrumb() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [bookCategories, setBookCategories] = useState([]);

    useEffect(() => {
        // Fetch book details
        axios.get(`http://localhost:9999/book/${id}`)
            .then(async (bookResponse) => {
                setBook(bookResponse.data);
                
                if (bookResponse.data.categories && bookResponse.data.categories.length > 0) {
                    try {
                        const categoriesResponse = await axios.get("http://localhost:9999/category");
                        
                        const relevantCategories = categoriesResponse.data.filter(
                            category => bookResponse.data.categories.includes(category._id)
                        );
                        
                        setBookCategories(relevantCategories);
                    } catch (error) {
                        console.error("Lỗi khi lấy danh mục:", error);
                    }
                }
            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu sách:", error);
            });
    }, [id]);

    return (
        <Box maxWidth="xl" m={"0px auto"} mt={4}>
            <Breadcrumbs separator="›" aria-label="breadcrumb" ml={"24px"}>
                <Link 
                    to="/" 
                    style={{ textDecoration: 'none', color: '#AAAAAA' }}
                >
                    Trang chủ
                </Link>
                
                {bookCategories.map((category) => (
                    <Link 
                        key={category._id} 
                        to={`/category/${category._id}`}
                        color="text.primary"
                        style={{ textDecoration: 'none', color: '#AAAAAA' }}
                        
                    >
                        {category.name}
                    </Link>
                ))}
                
                {book && <Typography sx={{ color: '#AAAAAA', fontWeight: 'bold'}}>{book.title}</Typography>}
            </Breadcrumbs>
        </Box>
    );
}

export default BookDetailBreadCrumb;