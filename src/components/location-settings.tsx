"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useToast } from "@/hooks/use-toast";
import type { LocationSettings as LocationSettingsType } from "@/types";

export function LocationSettings() {
  const [location, setLocation] = useState<LocationSettingsType>({ city: "Bhopal", lat: undefined, lon: undefined });
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocation = async () => {
      const docRef = doc(db, "settings", "location");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLocation(docSnap.data() as LocationSettingsType);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async () => {
    try {
      // Create a clean object to save, removing empty fields
      const dataToSave: Partial<LocationSettingsType> = { city: location.city };
      if (location.lat) dataToSave.lat = Number(location.lat);
      if (location.lon) dataToSave.lon = Number(location.lon);

      await setDoc(doc(db, "settings", "location"), dataToSave, { merge: true });
      toast({
        title: "Success",
        description: "Location saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save location.",
      });
    }
  };
  
  const handleChange = (field: keyof LocationSettingsType, value: string) => {
    setLocation(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
        <CardDescription>Set your preferred location for weather data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            placeholder="Enter a city name" 
            value={location.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input 
              id="lat" 
              type="number"
              placeholder="e.g. 23.2599" 
              value={location.lat || ""}
              onChange={(e) => handleChange("lat", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lon">Longitude</Label>
            <Input 
              id="lon" 
              type="number"
              placeholder="e.g. 77.4126" 
              value={location.lon || ""}
              onChange={(e) => handleChange("lon", e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Location</Button>
      </CardContent>
    </Card>
  );
}
