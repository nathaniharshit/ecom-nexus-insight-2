import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/profile')} 
              className="w-full"
              size="lg"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View My Order
            </Button>

            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="secondary"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/wishlist')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
