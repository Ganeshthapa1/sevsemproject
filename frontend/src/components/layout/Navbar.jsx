import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@chakra-ui/react';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isVendor, logout } = useAuth();

  return (
    <div>
      {isAdmin() && (
        <Button
          as={Link}
          to="/admin/dashboard"
          colorScheme="blue"
          variant="ghost"
        >
          Admin Dashboard
        </Button>
      )}
      {isVendor() && (
        <Button
          as={Link}
          to="/vendor/dashboard"
          colorScheme="green"
          variant="ghost"
        >
          Vendor Dashboard
        </Button>
      )}
    </div>
  );
};

export default Navbar; 