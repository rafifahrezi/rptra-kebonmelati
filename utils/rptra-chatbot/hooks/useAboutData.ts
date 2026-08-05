import { useState, useCallback, useEffect } from 'react';
import { AboutData } from '../types/AboutData';
import { DEFAULT_ABOUT_DATA } from '../constants/defaultAboutData';

export const useAboutData = () => {
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeAboutData = useCallback((apiData: any): AboutData => {
    if (!apiData) return DEFAULT_ABOUT_DATA;
    
    return {
      title: apiData.title || DEFAULT_ABOUT_DATA.title,
      subtitle: apiData.subtitle || DEFAULT_ABOUT_DATA.subtitle,
      mission: {
        title: apiData.mission?.title || DEFAULT_ABOUT_DATA.mission.title,
        description: apiData.mission?.description || DEFAULT_ABOUT_DATA.mission.description,
        image: apiData.mission?.image || DEFAULT_ABOUT_DATA.mission.image,
      },
      vision: {
        title: apiData.vision?.title || DEFAULT_ABOUT_DATA.vision.title,
        description: apiData.vision?.description || DEFAULT_ABOUT_DATA.vision.description,
      },
      values: {
        title: apiData.values?.title || DEFAULT_ABOUT_DATA.values.title,
        description: apiData.values?.description || DEFAULT_ABOUT_DATA.values.description,
      },
      programs: {
        title: apiData.programs?.title || DEFAULT_ABOUT_DATA.programs.title,
        description: apiData.programs?.description || DEFAULT_ABOUT_DATA.programs.description,
        items: Array.isArray(apiData.programs?.items) 
          ? apiData.programs.items 
          : DEFAULT_ABOUT_DATA.programs.items,
      },
      facilities: {
        title: apiData.facilities?.title || DEFAULT_ABOUT_DATA.facilities.title,
        description: apiData.facilities?.description || DEFAULT_ABOUT_DATA.facilities.description,
        items: Array.isArray(apiData.facilities?.items) 
          ? apiData.facilities.items 
          : DEFAULT_ABOUT_DATA.facilities.items,
        // CRITICAL FIX: Ensure images is always an array of strings
        images: Array.isArray(apiData.facilities?.images) 
          ? apiData.facilities.images.map((img: any) => {
              // Handle both ObjectId and string formats
              if (typeof img === 'string') return img;
              if (img && img._id) return img._id.toString();
              if (img && img.toString) return img.toString();
              return '';
            }).filter(Boolean)
          : [],
      },
      collaborations: {
        title: apiData.collaborations?.title || DEFAULT_ABOUT_DATA.collaborations.title,
        description: apiData.collaborations?.description || DEFAULT_ABOUT_DATA.collaborations.description,
        partners: Array.isArray(apiData.collaborations?.partners) 
          ? apiData.collaborations.partners 
          : DEFAULT_ABOUT_DATA.collaborations.partners,
      },
      operational: {
        title: apiData.operational?.title || DEFAULT_ABOUT_DATA.operational.title,
        hours: apiData.operational?.hours || DEFAULT_ABOUT_DATA.operational.hours,
      },
      establishedYear: apiData.establishedYear || DEFAULT_ABOUT_DATA.establishedYear,
      establishedText: apiData.establishedText || DEFAULT_ABOUT_DATA.establishedText,
      lastUpdated: apiData.lastUpdated || new Date().toISOString(),
    };
  }, []);

  const fetchAboutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/about", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch about data");
      }

      const normalizedData = normalizeAboutData(result.about);
      setAboutData(normalizedData);

    } catch (err) {
      console.error("Error fetching about data:", err);
      setError(`Gagal memuat data: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [normalizeAboutData]);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  return { aboutData, loading, error, refetch: fetchAboutData };
};