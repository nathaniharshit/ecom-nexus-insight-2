import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { mockOrders } from '../data/mockData';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setOrders([]);
        return;
      }

      // Fetch orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // If no orders in DB, use mock data as fallback
      if (!ordersData || ordersData.length === 0) {
        setOrders(mockOrders.filter(order => order.userId === session.user.id));
        return;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products:product_id (name, image_url)
            `)
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          const formattedItems = itemsData?.map(item => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: item.products?.name,
            product_image: item.products?.image_url,
            quantity: item.quantity,
            price: item.price
          })) || [];

          return {
            ...order,
            items: formattedItems
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
      
      // On error, fallback to mock data
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setOrders(mockOrders.filter(order => order.userId === session.user.id));
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items (*, products:product_id (name, image_url))
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (!data) {
        // Fallback to mock data
        const mockOrder = mockOrders.find(order => order.id === orderId);
        return mockOrder || null;
      }

      const formattedItems = data.order_items?.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.products?.name,
        product_image: item.products?.image_url,
        quantity: item.quantity,
        price: item.price
      })) || [];

      return {
        ...data,
        items: formattedItems
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      return null;
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, orderItems: Omit<OrderItem, 'id' | 'order_id'>[]) => {
    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Refresh orders list
      fetchOrders();

      toast({
        title: "Success",
        description: "Order placed successfully",
      });

      return { data: order, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));

      toast({
        title: "Success",
        description: "Order status updated",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateTrackingNumber = async (orderId: string, tracking_number: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ tracking_number })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, tracking_number } : order
      ));

      toast({
        title: "Success",
        description: "Tracking number updated",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating tracking number:', error);
      toast({
        title: "Error",
        description: "Failed to update tracking number",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateTrackingNumber
  };
}