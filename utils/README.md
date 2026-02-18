# Supabase Client

This folder contains the Supabase client configuration for the project.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example` and add your Supabase credentials:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Usage

```javascript
import supabase from "./supabaseClient.js";

// Query data
const { data, error } = await supabase.from("table_name").select("*");
```

For more information, visit [Supabase Documentation](https://supabase.com/docs)
