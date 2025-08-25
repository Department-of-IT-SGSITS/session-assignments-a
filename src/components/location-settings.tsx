"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useToast } from "@/hooks/use-toast";
import type { LocationSettings as LocationSettingsType } from "@/types";
import { MapPin } from "lucide-react";
import MapPicker from "@/components/map-picker";

export function LocationSettings() {
  const [location, setLocation] = useState<LocationSettingsType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSettingsType | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocation = async () => {
      const docRef = doc(db, "settings", "location");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLocation(docSnap.data() as LocationSettingsType);
      } else {
        const defaultLocation = { city: "Bhopal", lat: 23.2599, lon: 77.4126, displayName: "Bhopal, Madhya Pradesh, India" };
        setLocation(defaultLocation);
        await setDoc(docRef, defaultLocation);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async () => {
    const locationToSave = selectedLocation || location;
    if (locationToSave) {
      try {
        await setDoc(doc(db, "settings", "location"), locationToSave, { merge: true });
        setLocation(locationToSave);
        toast({
          title: "Success",
          description: "Location saved successfully.",
        });
        setIsMapOpen(false);
        setSelectedLocation(null); 
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save location.",
        });
      }
    }
  };

  const handleLocationSelect = (newSelection: LocationSettingsType) => {
    setSelectedLocation(newSelection);
  };

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading location settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
        <CardDescription>Your currently selected location.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{location.displayName || `Lat: ${location.lat}, Lon: ${location.lon}`}</span>
        </div>
        
        {isMapOpen ? (
          <div className="space-y-4">
            <MapPicker onLocationSelect={handleLocationSelect} current_lat={location.lat} current_lon={location.lon}/>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Location</Button>
              <Button onClick={() => setIsMapOpen(false)} variant="outline" className="w-full">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsMapOpen(true)} className="w-full">Change Location</Button>
        )}
      </CardContent>
    </Card>
  );
}
