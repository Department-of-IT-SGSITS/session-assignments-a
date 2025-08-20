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
  const [location, setLocation] = useState<LocationSettingsType>({ city: "Bhopal" });
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
      await setDoc(doc(db, "settings", "location"), location);
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
            onChange={(e) => setLocation({ city: e.target.value })}
          />
        </div>
        <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Location</Button>
      </CardContent>
    </Card>
  );
}
