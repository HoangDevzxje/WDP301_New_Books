import React from "react";
import { Breadcrumbs, Typography, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";

function BreadCrumb({ items = [] }) {
  return (
    <Box m={"20px 100px"}>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {items.map((item, index) =>
          item.link ? (
            <Link
              key={index}
              to={item.link}
              style={{ textDecoration: "none", color: "#AAAAAA" }}
            >
              {item.label}
            </Link>
          ) : (
            <Typography
              key={index}
              sx={{ color: "#AAAAAA", fontWeight: "bold" }}
            >
              {item.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </Box>
  );
}

export default BreadCrumb;
