

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_product_variant_quantity"("variant_id" "uuid", "quantity_to_subtract" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    UPDATE product_variants
    SET quantity = quantity - quantity_to_subtract
    WHERE id = variant_id;
  END;
  $$;


ALTER FUNCTION "public"."decrement_product_variant_quantity"("variant_id" "uuid", "quantity_to_subtract" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Delete the user from auth.users table
  DELETE FROM auth.users 
  WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_default_address"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    IF NEW.is_default = true THEN
      -- Unset any existing default for this customer
      UPDATE customer_addresses
      SET is_default = false
      WHERE customer_id = NEW.customer_id
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."ensure_single_default_address"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_promo_code_usage"("code_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    UPDATE promo_codes
    SET total_uses = total_uses + 1
    WHERE id = code_id;
  END;
  $$;


ALTER FUNCTION "public"."increment_promo_code_usage"("code_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collection_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "display_order" integer DEFAULT 0,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collection_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "banner_image_url" "text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."colors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "hex_code" "text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."colors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "street_address" "text" NOT NULL,
    "apartment" "text",
    "city_province" "text" NOT NULL,
    "country" "text" DEFAULT 'Cambodia'::"text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hero_banners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_url" "text" NOT NULL,
    "link_url" "text",
    "link_text" "text" DEFAULT 'Shop Now'::"text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."hero_banners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_variant_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "color_id" "uuid" NOT NULL,
    "size_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "promo_code_id" "uuid",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'PENDING'::"text",
    "shipping_address" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text" DEFAULT 'USD'::"text",
    CONSTRAINT "orders_currency_check" CHECK (("currency" = ANY (ARRAY['USD'::"text", 'KHR'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['PENDING'::"text", 'PAID'::"text", 'FAILED'::"text", 'REFUNDED'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONFIRMED'::"text", 'SHIPPED'::"text", 'DELIVERED'::"text", 'CANCELLED'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."currency" IS 'Transaction currency - USD or KHR';



CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "gateway" "text" NOT NULL,
    "gateway_transaction_id" "text",
    "type" "text" DEFAULT 'PURCHASE'::"text" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "status" "text" DEFAULT 'INITIATED'::"text" NOT NULL,
    "gateway_request" "jsonb",
    "gateway_response" "jsonb",
    "payment_url" "text",
    "payment_option" "text",
    "qr_string" "text",
    "abapay_deeplink" "text",
    "expires_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "callback_received_at" timestamp with time zone,
    "callback_data" "jsonb",
    "hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_transactions_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payment_transactions_currency_check" CHECK (("currency" = ANY (ARRAY['USD'::"text", 'KHR'::"text"]))),
    CONSTRAINT "payment_transactions_status_check" CHECK (("status" = ANY (ARRAY['INITIATED'::"text", 'PENDING'::"text", 'PROCESSING'::"text", 'COMPLETED'::"text", 'FAILED'::"text", 'CANCELLED'::"text", 'EXPIRED'::"text"]))),
    CONSTRAINT "payment_transactions_type_check" CHECK (("type" = ANY (ARRAY['PURCHASE'::"text", 'REFUND'::"text", 'VOID'::"text", 'PRE_AUTH'::"text"])))
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "color_id" "uuid" NOT NULL,
    "size_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 0 NOT NULL,
    "sku" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_variants_quantity_check" CHECK (("quantity" >= 0))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "base_price" numeric(10,2) NOT NULL,
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "subcategory_id" "uuid" NOT NULL,
    "banner_image_url" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "products_base_price_check" CHECK (("base_price" > (0)::numeric)),
    CONSTRAINT "products_discount_percentage_check" CHECK ((("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."deleted_at" IS 'Soft delete timestamp. NULL = active product, NOT NULL = deleted product';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "avatar_url" "text",
    "role" "text" DEFAULT 'customer'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "gender" "text" NOT NULL,
    "telephone" "text" NOT NULL,
    "city_province" "text" NOT NULL,
    CONSTRAINT "profiles_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'prefer not to say'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'customer'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_code_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promo_code_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "used_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promo_code_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "discount_percentage" numeric(5,2) NOT NULL,
    "max_uses_per_customer" integer DEFAULT 1,
    "total_uses" integer DEFAULT 0,
    "max_total_uses" integer,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "promo_codes_discount_percentage_check" CHECK ((("discount_percentage" > (0)::numeric) AND ("discount_percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."promo_codes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."promo_codes"."deleted_at" IS 'Soft delete timestamp. NULL = active coupon, NOT NULL = deleted/archived coupon.
  Used coupons should never be hard-deleted to preserve order history.';



CREATE TABLE IF NOT EXISTS "public"."shopping_cart" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "product_variant_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shopping_cart_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."shopping_cart" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sizes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."sizes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subcategories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subcategories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wishlist" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_unique" UNIQUE ("collection_id", "product_id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."colors"
    ADD CONSTRAINT "colors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."colors"
    ADD CONSTRAINT "colors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."colors"
    ADD CONSTRAINT "colors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hero_banners"
    ADD CONSTRAINT "hero_banners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_color_id_size_id_key" UNIQUE ("product_id", "color_id", "size_id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_product_code_key" UNIQUE ("product_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_telephone_key" UNIQUE ("telephone");



ALTER TABLE ONLY "public"."promo_code_usage"
    ADD CONSTRAINT "promo_code_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_code_usage"
    ADD CONSTRAINT "promo_code_usage_promo_code_id_order_id_key" UNIQUE ("promo_code_id", "order_id");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopping_cart"
    ADD CONSTRAINT "shopping_cart_customer_id_product_variant_id_key" UNIQUE ("customer_id", "product_variant_id");



ALTER TABLE ONLY "public"."shopping_cart"
    ADD CONSTRAINT "shopping_cart_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sizes"
    ADD CONSTRAINT "sizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sizes"
    ADD CONSTRAINT "sizes_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."subcategories"
    ADD CONSTRAINT "subcategories_name_category_id_key" UNIQUE ("name", "category_id");



ALTER TABLE ONLY "public"."subcategories"
    ADD CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_customer_id_product_id_key" UNIQUE ("customer_id", "product_id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cart_customer" ON "public"."shopping_cart" USING "btree" ("customer_id");



CREATE INDEX "idx_colors_active" ON "public"."colors" USING "btree" ("is_active");



CREATE INDEX "idx_colors_name" ON "public"."colors" USING "btree" ("name");



CREATE INDEX "idx_customer_addresses_customer_id" ON "public"."customer_addresses" USING "btree" ("customer_id");



CREATE INDEX "idx_customer_addresses_default" ON "public"."customer_addresses" USING "btree" ("customer_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_hero_banners_active_order" ON "public"."hero_banners" USING "btree" ("is_active", "display_order");



CREATE INDEX "idx_order_items_color" ON "public"."order_items" USING "btree" ("color_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_size" ON "public"."order_items" USING "btree" ("size_id");



CREATE INDEX "idx_orders_created" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_customer" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_payment_transactions_expired" ON "public"."payment_transactions" USING "btree" ("expires_at") WHERE (("status" = ANY (ARRAY['INITIATED'::"text", 'PENDING'::"text"])) AND ("expires_at" IS NOT NULL));



CREATE INDEX "idx_payment_transactions_gateway_id" ON "public"."payment_transactions" USING "btree" ("gateway_transaction_id") WHERE ("gateway_transaction_id" IS NOT NULL);



CREATE INDEX "idx_payment_transactions_gateway_status" ON "public"."payment_transactions" USING "btree" ("gateway", "status");



CREATE INDEX "idx_payment_transactions_order_id" ON "public"."payment_transactions" USING "btree" ("order_id");



CREATE INDEX "idx_payment_transactions_status" ON "public"."payment_transactions" USING "btree" ("status");



CREATE INDEX "idx_product_code" ON "public"."products" USING "btree" ("product_code");



CREATE INDEX "idx_product_images_product" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_color" ON "public"."product_variants" USING "btree" ("color_id");



CREATE INDEX "idx_product_variants_product" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_quantity" ON "public"."product_variants" USING "btree" ("quantity");



CREATE INDEX "idx_product_variants_size" ON "public"."product_variants" USING "btree" ("size_id");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_products_deleted_at" ON "public"."products" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_products_subcategory" ON "public"."products" USING "btree" ("subcategory_id");



CREATE INDEX "idx_promo_codes_active" ON "public"."promo_codes" USING "btree" ("is_active");



CREATE INDEX "idx_promo_codes_code" ON "public"."promo_codes" USING "btree" ("code");



CREATE INDEX "idx_promo_codes_deleted_at" ON "public"."promo_codes" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_promo_usage_code" ON "public"."promo_code_usage" USING "btree" ("promo_code_id");



CREATE INDEX "idx_promo_usage_customer" ON "public"."promo_code_usage" USING "btree" ("customer_id");



CREATE INDEX "idx_status_history_order" ON "public"."order_status_history" USING "btree" ("order_id");



CREATE INDEX "idx_wishlist_customer" ON "public"."wishlist" USING "btree" ("customer_id");



CREATE OR REPLACE TRIGGER "delete_auth_user_trigger" AFTER DELETE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."delete_auth_user"();



CREATE OR REPLACE TRIGGER "enforce_single_default_address" BEFORE INSERT OR UPDATE ON "public"."customer_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_default_address"();



CREATE OR REPLACE TRIGGER "update_colors_updated_at" BEFORE UPDATE ON "public"."colors" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_promo_codes_updated_at" BEFORE UPDATE ON "public"."promo_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_sizes_updated_at" BEFORE UPDATE ON "public"."sizes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hero_banners"
    ADD CONSTRAINT "hero_banners_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_code_usage"
    ADD CONSTRAINT "promo_code_usage_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_code_usage"
    ADD CONSTRAINT "promo_code_usage_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promo_code_usage"
    ADD CONSTRAINT "promo_code_usage_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."shopping_cart"
    ADD CONSTRAINT "shopping_cart_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_cart"
    ADD CONSTRAINT "shopping_cart_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subcategories"
    ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



CREATE POLICY "Allow users to create their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Colors are viewable by everyone" ON "public"."colors" FOR SELECT USING (true);



CREATE POLICY "Enable CRUD for authenticated users on own cart" ON "public"."shopping_cart" TO "authenticated" USING (("auth"."uid"() = "customer_id")) WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Product variants are viewable by everyone" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Products are viewable by everyone" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Sizes are viewable by everyone" ON "public"."sizes" FOR SELECT USING (true);



CREATE POLICY "Users can delete own addresses" ON "public"."customer_addresses" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can insert own addresses" ON "public"."customer_addresses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can select own addresses" ON "public"."customer_addresses" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can update own addresses" ON "public"."customer_addresses" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "customer_id")) WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own payment transactions" ON "public"."payment_transactions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "payment_transactions"."order_id") AND ("orders"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collection_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."colors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hero_banners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_code_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shopping_cart" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sizes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subcategories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."decrement_product_variant_quantity"("variant_id" "uuid", "quantity_to_subtract" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_product_variant_quantity"("variant_id" "uuid", "quantity_to_subtract" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_product_variant_quantity"("variant_id" "uuid", "quantity_to_subtract" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_default_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_address"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("code_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("code_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("code_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."collection_products" TO "anon";
GRANT ALL ON TABLE "public"."collection_products" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_products" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."colors" TO "anon";
GRANT ALL ON TABLE "public"."colors" TO "authenticated";
GRANT ALL ON TABLE "public"."colors" TO "service_role";



GRANT ALL ON TABLE "public"."customer_addresses" TO "anon";
GRANT ALL ON TABLE "public"."customer_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."hero_banners" TO "anon";
GRANT ALL ON TABLE "public"."hero_banners" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_banners" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."promo_code_usage" TO "anon";
GRANT ALL ON TABLE "public"."promo_code_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."promo_code_usage" TO "service_role";



GRANT ALL ON TABLE "public"."promo_codes" TO "anon";
GRANT ALL ON TABLE "public"."promo_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."promo_codes" TO "service_role";



GRANT ALL ON TABLE "public"."shopping_cart" TO "anon";
GRANT ALL ON TABLE "public"."shopping_cart" TO "authenticated";
GRANT ALL ON TABLE "public"."shopping_cart" TO "service_role";



GRANT ALL ON TABLE "public"."sizes" TO "anon";
GRANT ALL ON TABLE "public"."sizes" TO "authenticated";
GRANT ALL ON TABLE "public"."sizes" TO "service_role";



GRANT ALL ON TABLE "public"."subcategories" TO "anon";
GRANT ALL ON TABLE "public"."subcategories" TO "authenticated";
GRANT ALL ON TABLE "public"."subcategories" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist" TO "anon";
GRANT ALL ON TABLE "public"."wishlist" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























