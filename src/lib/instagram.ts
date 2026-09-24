export interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  children?: {
    data: {
      id: string;
      media_type: string;
      media_url: string;
    }[];
  };
}

export async function getInstagramPosts(limit = 12): Promise<InstagramPost[]> {
  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
  const IG_USER_ID = process.env.IG_USER_ID;

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    console.warn("Missing Instagram environment variables.");
    return [];
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=${limit}&access_token=${IG_ACCESS_TOKEN}`;
    
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API Error:", errorData);
      return [];
    }

    const data = await response.json();
    return data.data as InstagramPost[];
  } catch (error) {
    console.error("Failed to fetch Instagram posts:", error);
    return [];
  }
}

export async function getInstagramPost(id: string): Promise<InstagramPost | null> {
  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
  
  if (!IG_ACCESS_TOKEN) return null;

  try {
    // Facebook API requires URL encoding for {} in fields
    const url = `https://graph.facebook.com/v19.0/${id}?fields=id,caption,media_type,media_url,permalink,timestamp,children%7Bid,media_type,media_url%7D&access_token=${IG_ACCESS_TOKEN}`;
    
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      return null;
    }

    return await response.json() as InstagramPost;
  } catch (error) {
    console.error("Failed to fetch Instagram post detail:", error);
    return null;
  }
}
