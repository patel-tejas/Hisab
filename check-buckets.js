
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config({ path: '.env' });       // Fallback to .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
    console.log('Checking buckets for:', supabaseUrl);
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
    } else {
        console.log('Available buckets:', data);
        const tradesBucket = data.find(b => b.name === 'trades');
        if (!tradesBucket) {
            console.log("\n❌ Bucket 'trades' NOT found.");
            console.log("Please create a public bucket named 'trades' in your Supabase dashboard.");
        } else {
            console.log("\n✅ Bucket 'trades' found.");
        }
    }
}

listBuckets();
