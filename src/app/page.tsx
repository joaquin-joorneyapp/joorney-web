'use client';

import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  Calendar,
  Compass,
  Heart,
  Map,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthUserContext } from '@/contexts/AuthUserContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useContext(AuthUserContext);

  const navigateTo = (path: string) => {
    if (user?.isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, containScroll: 'trimSnaps' },
    [AutoScroll({ playOnInit: true })]
  );

  const cities = [
    { name: 'Paris', slug: 'paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { name: 'Tokyo', slug: 'tokyo', image: 'https://i.pinimg.com/736x/12/ef/8a/12ef8ad05ccdf05b1571e8f3dd138ffa.jpg' },
    { name: 'Rome', slug: 'rome', image: 'https://i.pinimg.com/1200x/37/3d/dc/373ddca9c9fc9f26dba60fb784c17a2d.jpg' },
    { name: 'New York', slug: 'new-york', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Barcelona', slug: 'barcelona', image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80' },
    { name: 'London', slug: 'london', image: 'https://i.pinimg.com/1200x/6c/33/2b/6c332bfe7e4cacc4e34dd1635c8cb79c.jpg' },
    { name: 'Dubai', slug: 'dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Singapore', slug: 'singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sydney', slug: 'sydney', image: 'https://i.pinimg.com/736x/f6/76/ff/f676ff7ec7f01ced5b469b95a1f02e89.jpg' },
    { name: 'Amsterdam', slug: 'amsterdam', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(to bottom, #FFF3E0, #FFFFFF)',
          pt: 10,
          pb: 12,
          minHeight: '100vh'
        }}
      >
        <Container maxWidth={false}>
          <Box sx={{ textAlign: 'center'}}>
            <Box
              component="img"
              src="/logo.svg"
              alt="logo"
              width="100"
              
              height={{ md: 86, xs: 65 }}
            />

            <Typography
              gutterBottom
              sx={{ mt: 6, typography: { xs: 'h3', md: 'h2' } }}
            >
              Your Perfect City Guide
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 720, mx: 'auto', mb: 8 }}
            >
              Discover and explore cities like never before. No research needed
              - just choose your destination and let us plan the perfect trip
              for you.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigateTo('/new-plan')}
              size="large"
              endIcon={<ArrowRight />}
              sx={{ mb: 9, color: 'white' }}
            >
              Start
            </Button>

            {/* City Images Carousel */}
            <Box
              ref={emblaRef}
              className="embla"
              sx={{ overflow: 'hidden' }}
            >
              <Box className="embla__container" sx={{ display: 'flex' }}>
                {cities.map((city, index) => (
                  <Box
                    key={index}
                    className="embla__slide"
                    sx={{
                      position: 'relative',
                      flexShrink: 0,
                      pl: 2,
                    }}
                  >
                    <Card
                      onClick={() => navigateTo(`/new-plan?city=${city.slug}&step=1`)}
                      sx={{
                        height: {xs: 220, md: 300},
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover .overlay': {
                          opacity: 1,
                        },
                        '&:hover img': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={city.image}
                        alt={city.name}
                        sx={{
                          height: { xs: 220, md: 300 }, 
                          transition: 'transform 0.7s',
                        }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          p: 3,
                          opacity: 0,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        <Typography variant="h6" color="white">
                          {city.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ opacity: 0.8 }}
                        >
                          Discover the magic of {city.name}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>

      </Box>

      {/* How It Works Section */}
      <Box sx={{ pt: {xs: 6, md: 12}, pb: 20, maxHeight: '100vh', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{ typography: { xs: 'h3', md: 'h2' } }}
            align="center"
            gutterBottom
          >
            Plan Your Trip in 4 Simple Steps
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                icon: <MapPin />,
                title: 'Choose City',
                description:
                  'Select your dream destination from our curated list of cities',
              },
              {
                icon: <Calendar />,
                title: 'Set Duration',
                description: "Tell us how many days you'll be exploring",
              },
              {
                icon: <Heart />,
                title: 'Pick Interests',
                description:
                  'Share your preferences to personalize your experience',
              },
              {
                icon: <Map />,
                title: 'Enjoy the Trip',
                description:
                  'Follow your custom itinerary and make adjustments on the go',
              },
            ].map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <IconButton
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'white',
                      mb: 2,
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                    size="large"
                  >
                    {step.icon}
                  </IconButton>
                  <Typography variant="h6" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Feature Highlight */}
      <Box sx={{ bgcolor: '#FFF3E0', py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                sx={{ typography: { xs: 'h3', md: 'h2' } }}
                gutterBottom
              >
                Everything You Need in One Place
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                No more endless research or multiple apps. Joorney provides all
                the information you need to explore a city, from must-see
                attractions to hidden gems.
              </Typography>
              <List>
                {[
                  'Curated local experiences',
                  'Flexible itineraries that adapt to you',
                  'Offline access to all information',
                ].map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Compass
                          style={{ color: 'white', width: 20, height: 20 }}
                        />
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 4,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800"
                  alt="Travel Experience"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography sx={{typography: { xs: 'h3', md: 'h2' }}} gutterBottom>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join thousands of travelers who have discovered the easiest way to
            explore new cities.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ color: 'white' }}
            endIcon={<ArrowRight />}
          >
            Download App
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

/*

<Stack>
      <Grid container>
        <Grid md={6} sm={12}>
          <Box
            sx={{ display: 'flex' }}
            style={{ width: '100%' }}
            px={{ xs: 1, md: 10 }}
            height={{ md: '100vh', xs: '80vh' }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="logo"
              width="100"
              style={{ marginTop: '1rem' }}
              height={{ md: 70, xs: 50 }}
            />
            <Typography
              variant="body2"
              fontSize={{ xs: 20, md: 25 }}
              mt={4.5}
              align="center"
            >
              Choose a city, select the number of days, pick your preferred
              activities and let us build the perfect trip for you.
            </Typography>
            <Button
              sx={{ color: 'white', fontSize: {md: 'x-large', xs: 'large'}, mt: {md: 3.5, xs: 6}, width: 200 }}
              variant="contained"
              color="primary"
              onClick={() => navigateTo('/new-plan')}
            >
              Start
            </Button>
          </Box>
        </Grid>
        <Grid md={6} sm={12}>
          <Box
            component="img"
            src={'/pictures/main/ss.png'}
            sx={{
              display: 'flex',
            }}
            height={{ md: '100vh', xs: undefined }}
            width={{ md: '100%', xs: '90%' }}
            marginLeft={{ xs: '5%' }}
            marginBottom={{ xs: '5%' }}
          />
        </Grid>
      </Grid>
    </Stack>

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Empire State',
  },

  {
    img: 'https://plus.unsplash.com/premium_photo-1673483585905-439b19e0d30a?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',

    title: 'SF',
  },
  {
    img: 'https://images.unsplash.com/photo-1608753527764-81065db0f78b?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Gaudi',
  },
  {
    img: 'https://images.unsplash.com/photo-1492666673288-3c4b4576ad9a?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Sink',
  },
  {
    img: 'https://images.unsplash.com/photo-1600042863738-970c0d567f6b?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Vessel',
  },
  {
    img: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Brooklyn',
  },
  {
    img: 'https://images.unsplash.com/photo-1549737328-8b9f3252b927?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Forest',
  },

  {
    img: 'https://images.unsplash.com/photo-1598162461164-5cb059c382c6?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Bariloche',
  },
  {
    img: 'https://plus.unsplash.com/premium_photo-1673266630625-92c62a6dfde7?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Golden State',
  },
  {
    img: 'https://i.pinimg.com/564x/ae/61/7e/ae617ec033ccf4ac2837d3167d869adf.jpg',
    title: '7 colours',
  },
];

*/
