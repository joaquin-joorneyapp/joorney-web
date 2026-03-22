'use client';

import { AuthUserContext } from '@/contexts/AuthUserContext';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

const pages = [
  { name: 'Home', href: '/home' },
  { name: 'New Trip', href: '/new-plan' },
  { name: 'Explore', href: '/explore' },
  { name: 'Saved Plans', href: '/saved-plans', onlyLoggedUsers: true },
  {
    name: 'Data Management',
    href: '/cities',
    onlyAdminUsers: true,
  },
  { name: 'Log in', href: '/login', onlyAnonymUsers: true },
  { name: 'Sign up', href: '/signup', onlyAnonymUsers: true },
];
const settings = [
  {
    name: 'Logout',
    handle: () => {
      localStorage.clear();
      window.location.href = '/login';
    },
  },
];

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useContext(AuthUserContext);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => setAnchorElNav(null);

  const handleClickNavMenu = (href: string) => {
    router.push(href);
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const effectiveUser = mounted ? user : null;
  const visiblePages = pages.filter((p) => {
    if (p.onlyAdminUsers && !effectiveUser?.isAdmin) return false;
    return (
      (!p.onlyAnonymUsers && !p.onlyLoggedUsers) ||
      (p.onlyAnonymUsers && !effectiveUser?.isAuthenticated) ||
      (p.onlyLoggedUsers && effectiveUser?.isAuthenticated)
    );
  });

  return (
    <AppBar sx={{ backgroundColor: 'white' }} elevation={0}>
      <Container maxWidth={false}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { md: 90, xs: 80 },
            padding: { md: '0 3rem 0 3rem' },
          }}
          id="toolbar"
        >
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Image src="/logo.svg" alt="Joorney" width={120} height={40} onClick={() => router.push('/')} style={{ cursor: 'pointer' }} />
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              sx={{ px: { xs: 0.5 } }}
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {visiblePages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={() => handleClickNavMenu(page.href)}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <Image src="/logo.svg" alt="Joorney" width={100} height={34} onClick={() => router.push('/')} style={{ cursor: 'pointer' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {visiblePages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleClickNavMenu(page.href)}
                color="secondary"
                size={'large'}
                sx={{ my: 2 }}
                style={{ textTransform: 'none' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          <Box sx={{ mr: 0 }}>
            {effectiveUser?.isAuthenticated ? (
              <Tooltip title="Open settings" style={{ marginLeft: '1rem' }}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={effectiveUser.name}>{effectiveUser.name ? effectiveUser.name[0] : ''}</Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ display: { xs: 'flex', md: 'none' }, mx: 0 }}>
                <Button
                  onClick={() => handleClickNavMenu('/login')}
                  color="secondary"
                  size={'large'}
                  sx={{ mr: -1, ml: -1.2 }}
                  style={{ textTransform: 'initial', fontSize: 20 }}
                >
                  Log in
                </Button>
              </Box>
            )}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  onClick={() => (setting.handle(), handleCloseUserMenu())}
                >
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
