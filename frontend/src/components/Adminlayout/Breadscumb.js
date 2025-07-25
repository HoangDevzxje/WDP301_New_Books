import React from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const BreadcrumbsNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography key={index} color="text.primary">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
        ) : (
          <Typography key={index} color="text.primary">
            <Link to={routeTo} className="breadcrumb-link">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Link>
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
