import { createClient } from '@supabase/supabase-js'

// Substitua pelas suas credenciais reais do Supabase
const supabaseUrl = 'https://fmcwqvaucehrurnachkz.supabase.co'
const supabaseKey = 'sb_publishable_RclBtzNpo31qCF98eWl_iw_6JwcggKU'

export const supabase = createClient(supabaseUrl, supabaseKey)