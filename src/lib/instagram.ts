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

export async function getInstagramPosts(limit = 100): Promise<InstagramPost[]> {
  const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
  const IG_USER_ID = process.env.IG_USER_ID;

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    console.warn("Missing Instagram environment variables.");
    return [];
  }

  try {
    let allPosts: InstagramPost[] = [];
    let url: string | null = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,children%7Bmedia_url,media_type%7D&limit=${limit}&access_token=${IG_ACCESS_TOKEN}`;
    
    while (url && allPosts.length < 500) {
      const res: Response = await fetch(url, { next: { revalidate: 60 } }); 
      
      if (!res.ok) {
        const errorData: any = await res.json();
        console.error("Instagram API Error:", errorData);
        break;
      }
      
      const responseData: any = await res.json();
      if (responseData.data) {
        allPosts = [...allPosts, ...responseData.data];
      }
      
      url = responseData.paging?.next || null;
    }

    return allPosts;
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
