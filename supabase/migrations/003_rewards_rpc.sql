-- EcoSphere Atomic Reward Redemption RPC
-- Created: 2026-07-12

CREATE OR REPLACE FUNCTION public.redeem_reward(p_user_id UUID, p_reward_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_points_required INT;
  v_stock INT;
  v_balance INT;
BEGIN
  -- Lock rows to prevent race conditions
  SELECT points_required, stock INTO v_points_required, v_stock
  FROM public.rewards WHERE id = p_reward_id FOR UPDATE;
  
  SELECT points_balance INTO v_balance
  FROM public.users WHERE id = p_user_id FOR UPDATE;
  
  IF v_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found');
  END IF;
  
  IF v_stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;
  
  IF v_balance < v_points_required THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points balance');
  END IF;
  
  -- Perform updates atomically
  UPDATE public.rewards SET stock = stock - 1 WHERE id = p_reward_id;
  UPDATE public.users SET points_balance = points_balance - v_points_required WHERE id = p_user_id;
  
  -- Insert redemption transaction
  INSERT INTO public.reward_redemptions (user_id, reward_id) VALUES (p_user_id, p_reward_id);
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
