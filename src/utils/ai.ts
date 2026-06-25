export async function getAiCoachRecommendation(historySummary: string, hardcoreMode: boolean): Promise<string> {
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ historySummary, hardcoreMode }),
    });
    if (!response.ok) {
      throw new Error('API request failed');
    }
    const data = await response.json();
    return data.recommendation;
  } catch (error) {
    console.error('Error fetching AI recommendation:', error);
    return `“Zenji observes that you are maintaining Stoic posturing, but the scroll connection is deep in the clouds. Take a deep breath and continue.”`;
  }
}
