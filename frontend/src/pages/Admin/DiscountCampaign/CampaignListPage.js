import React, { useEffect, useState } from "react";
import {
  getAllCampaigns,
  deleteCampaign,
} from "../../../services/AdminService/discountCampaignService";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CampaignListPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getAllCampaigns();
      setCampaigns(data.data || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá chiến dịch này?")) {
      await deleteCampaign(id);
      fetchCampaigns();
    }
  };

  return (
    <div>
      <Typography variant="h5" mb={2}>
        Danh sách chiến dịch giảm giá
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("add")}
      >
        Tạo chiến dịch
      </Button>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Tên chiến dịch</TableCell>
            <TableCell>Phần trăm</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Số sách</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.length > 0 ? (
            campaigns.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>
                  {new Date(item.startDate).toLocaleDateString()} -{" "}
                  {new Date(item.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {item.isActive ? "Đang hoạt động" : "Đã tắt"}
                </TableCell>
                <TableCell>{item.books.length}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => navigate(`${item._id}/edit`)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(item._id)}
                  >
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Không có chiến dịch nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignListPage;
