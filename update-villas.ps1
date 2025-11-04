# Update Villa Images Script
$file = "src\components\VillasSection.jsx"
$content = Get-Content $file -Raw

# Update Palacio Musical detailImages
$oldMusicalDetail = '"/images/villas/palicio-musical/98986715.jpg",
        "/images/villas/palicio-musical/98984225.jpg",
        "/images/villas/palicio-musical/98990146.jpg"
      ]'
$newMusicalDetail = '"/images/villas/palicio-musical/98986715.jpg",
        "/images/villas/palicio-musical/98984225.jpg",
        "/images/villas/palicio-musical/98990146.jpg",
        "/images/villas/palicio-musical/99010031.jpg",
        "/images/villas/palicio-musical/99498420.jpg",
        "/images/villas/palicio-musical/198134112.jpg"
      ]'
$content = $content.Replace($oldMusicalDetail, $newMusicalDetail)

# Update Palms Villa images
$oldPalmsImages = '"/images/villas/the-palms-villa-estate/5c47af67-d690-42e8-ae02-7e8011fc52ed.avif",
        "/images/villas/the-palms-villa-estate/30e39a33-4457-4f91-be63-2c9c0fcdb863.jpeg",
        "/images/villas/the-palms-villa-estate/4e674d32-d726-4169-84ae-555f037c13b0.jpeg"
      ]'
$newPalmsImages = '"/images/villas/the-palms-villa-estate/56.Aerial-9.jpeg",
        "/images/villas/the-palms-villa-estate/4.Aerial-4.jpeg",
        "/images/villas/the-palms-villa-estate/6.Aerial-5.jpeg"
      ]'
$content = $content.Replace($oldPalmsImages, $newPalmsImages)

# Update Palms Villa detailImages
$oldPalmsDetail = '"/images/villas/the-palms-villa-estate/3010682d-f127-4ff9-b647-099323082072.jpeg",
        "/images/villas/the-palms-villa-estate/30e39a33-4457-4f91-be63-2c9c0fcdb863.jpeg",
        "/images/villas/the-palms-villa-estate/4e674d32-d726-4169-84ae-555f037c13b0.jpeg",
        "/images/villas/the-palms-villa-estate/910cba2e-cbaf-41f4-a725-57ddbebf7ac1.jpeg",
        "/images/villas/the-palms-villa-estate/d990535c-645c-4e23-b04f-9c4f3bd9040c.jpeg",
        "/images/villas/the-palms-villa-estate/f9aafc09-ec54-4b03-a21b-a4d799f059c1.jpeg",
        "/images/villas/the-palms-villa-estate/12438d67-cf43-4bfe-bf7d-07244f3301dc.webp",
        "/images/villas/the-palms-villa-estate/2eedf0e6-1325-4143-bfc6-a6abae26f1ef.avif"
      ]'
$newPalmsDetail = '"/images/villas/the-palms-villa-estate/56.Aerial-9.jpeg",
        "/images/villas/the-palms-villa-estate/4.Aerial-4.jpeg",
        "/images/villas/the-palms-villa-estate/6.Aerial-5.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_0194.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_0224.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_0739.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_0753.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_1718.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_1727.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_7170.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_9888.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_9951.jpeg",
        "/images/villas/the-palms-villa-estate/IMG_9951.jpeg"
      ]'
$content = $content.Replace($oldPalmsDetail, $newPalmsDetail)

# Update View House images
$oldViewImages = '"/images/villas/the-view-house/07754857-bf71-4cc5-953e-39b3f959484a.avif",
        "/images/villas/the-view-house/25d56bc7-19f0-4a97-b056-f39312120697.avif",
        "/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif"
      ]'
$newViewImages = '"/images/villas/the-view-house/d9555571cd99-3bbc-41d2-900f-8372442d68a9.avif",
        "/images/villas/the-view-house/25d56bc7-19f0-4a97-b056-f39312120697.avif",
        "/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif"
      ]'
$content = $content.Replace($oldViewImages, $newViewImages)

# Update View House detailImages
$oldViewDetail = '"/images/villas/the-view-house/07754857-bf71-4cc5-953e-39b3f959484a.avif",
        "/images/villas/the-view-house/25d56bc7-19f0-4a97-b056-f39312120697.avif",
        "/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif",
        "/images/villas/the-view-house/3c3b16b7-77de-4fdb-97e7-cd4e5d2f533d.avif",
        "/images/villas/the-view-house/9bcd8e7b-6d80-4b65-b878-68835b7b243b.avif",
        "/images/villas/the-view-house/caee2b00-03a2-438e-981c-8d98e57f6d43.avif",
        "/images/villas/the-view-house/d971cd99-3bbc-41d2-900f-8372442d68a9.avif",
        "/images/villas/the-view-house/f24aa4e9-2615-4491-b70c-90c87f804686.avif"
      ]'
$newViewDetail = '"/images/villas/the-view-house/d9555571cd99-3bbc-41d2-900f-8372442d68a9.avif",
        "/images/villas/the-view-house/25d56bc7-19f0-4a97-b056-f39312120697.avif",
        "/images/villas/the-view-house/3a85d083-c4c6-4289-93d9-d2e92feff052.avif",
        "/images/villas/the-view-house/3c3b16b7-77de-4fdb-97e7-cd4e5d2f533d.avif",
        "/images/villas/the-view-house/9bcd8e7b-6d80-4b65-b878-68835b7b243b.avif",
        "/images/villas/the-view-house/caee2b00-03a2-438e-981c-8d98e57f6d43.avif",
        "/images/villas/the-view-house/d971cd99-3bbc-41d2-900f-8372442d68a9.avif",
        "/images/villas/the-view-house/f24aa4e9-2615-4491-b70c-90c87f804686.avif"
      ]'
$content = $content.Replace($oldViewDetail, $newViewDetail)

# Add Tennis Court to Palms amenities
$oldPalmsAmenities = '{ name: "Event Hosting", icon: "fa-calendar" }
      ]'
$newPalmsAmenities = '{ name: "Event Hosting", icon: "fa-calendar" },
        { name: "Private Tennis Court", icon: "fa-table-tennis" }
      ]'
$content = $content.Replace($oldPalmsAmenities, $newPalmsAmenities)

Set-Content $file -Value $content -NoNewline
Write-Output "✓ Alle Villa-Bilder und Details aktualisiert!"
