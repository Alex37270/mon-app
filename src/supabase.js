import { createClient } from "@supabase/supabase-js"
const supabaseUrl = 'https://mqsxqhiuexfaidbohtcz.supabase.co'
const supabaseKey = 'sb_publishable_ngGDC6IzaQxGUNW9aIAaoQ_SlTWHue8'
export const supabase = createClient(supabaseUrl, supabaseKey)

