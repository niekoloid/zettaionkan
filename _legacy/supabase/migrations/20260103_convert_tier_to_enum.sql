-- Create the ENUM type
CREATE TYPE subscription_tier_type AS ENUM ('free', 'entry', 'standard', 'premium');

-- 1. Drop the existing default value to avoid casting errors during type conversion
ALTER TABLE profiles 
  ALTER COLUMN subscription_tier DROP DEFAULT;

-- 2. Ensure no NULL values exist before converting and setting NOT NULL
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- 3. Update the profiles table to use the ENUM type
ALTER TABLE profiles 
  ALTER COLUMN subscription_tier TYPE subscription_tier_type 
  USING subscription_tier::subscription_tier_type;

-- 4. Set the new default value and Add NOT NULL constraint
ALTER TABLE profiles 
  ALTER COLUMN subscription_tier SET DEFAULT 'free'::subscription_tier_type,
  ALTER COLUMN subscription_tier SET NOT NULL;
