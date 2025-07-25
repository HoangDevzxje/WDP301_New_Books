import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, Divider, Link, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import { Book, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <Box component="footer" bgcolor="grey.900" color="white" py={6}>
      <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}  >
            <Box display="flex" alignItems="center" mb={2}>
              <Book color="#facc15" style={{ marginRight: 8 }} />
              <Typography variant="h6" fontWeight="bold" fontFamily="serif">NewBooks</Typography>
            </Box>
            <Typography variant="body2" color="grey.400" mb={2}>
              Your destination for quality books at affordable prices. Discover a world of knowledge and imagination.
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton component="a" href="#" color="inherit">
                <Facebook />
              </IconButton>
              <IconButton component="a" href="#" color="inherit">
                <Twitter />
              </IconButton>
              <IconButton component="a" href="#" color="inherit">
                <Instagram />
              </IconButton>
            </Stack>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }} >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Divider sx={{ backgroundColor: 'grey.700', mb: 2 }} />
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="grey.400" underline="hover">Home</Link>
              <Link component={RouterLink} to="/books" color="grey.400" underline="hover">Books</Link>
              <Link component={RouterLink} to="/categories" color="grey.400" underline="hover">Categories</Link>
              <Link component={RouterLink} to="/about" color="grey.400" underline="hover">About Us</Link>
              <Link component={RouterLink} to="/contact" color="grey.400" underline="hover">Contact</Link>
            </Stack>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }} >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Categories
            </Typography>
            <Divider sx={{ backgroundColor: 'grey.700', mb: 2 }} />
            <Stack spacing={1}>
              <Link component={RouterLink} to="/categories/fiction" color="grey.400" underline="hover">Fiction</Link>
              <Link component={RouterLink} to="/categories/non-fiction" color="grey.400" underline="hover">Non-Fiction</Link>
              <Link component={RouterLink} to="/categories/mystery" color="grey.400" underline="hover">Mystery & Thriller</Link>
              <Link component={RouterLink} to="/categories/sci-fi" color="grey.400" underline="hover">Science Fiction</Link>
              <Link component={RouterLink} to="/categories/self-help" color="grey.400" underline="hover">Self-Help</Link>
            </Stack>
          </Grid>

          <Grid  size={{ xs: 12, sm: 6, md: 3 }} >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contact Us
            </Typography>
            <Divider sx={{ backgroundColor: 'grey.700', mb: 2 }} />
            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start">
                <MapPin color="#facc15" size={20} style={{ marginRight: 8, marginTop: 2 }} />
                <Typography variant="body2" color="grey.400">FPT University, Hoa Lac, Ha Noi</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Phone color="#facc15" size={20} style={{ marginRight: 8 }} />
                <Typography variant="body2" color="grey.400">+84 866 052 283</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Mail color="#facc15" size={20} style={{ marginRight: 8 }} />
                <Typography variant="body2" color="grey.400">NewBooks@gmail.com</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ backgroundColor: 'grey.800', my: 4 }} />
        <Typography variant="body2" align="center" color="grey.500">
          &copy; {new Date().getFullYear()} NewBooks. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
