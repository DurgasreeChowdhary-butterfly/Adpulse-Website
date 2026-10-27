# AdPulse Website – Admin Guide

This guide explains how to change the website's content yourself. You don't need any technical knowledge. Changes
appear on the website as soon as you click **Save**: refresh the page to see them.

## Logging in

1. Open the admin panel: **https://www.adpulsedigital.in/admin**. While the site is being built, it's
   http://localhost:3000/admin.
2. Enter your email and password, then click **Login**.
3. **The very first time only**, there is no account yet. You'll see a **Create first user** form. Enter your name,
   email and a strong password. That account becomes the main admin.
4. To add another admin, open **Settings → Admin users → Create new**.

Forgot your password? Click **Forgot password?** on the login screen. Until email sending is set up, ask your
developer to reset it.

## How the admin is organised

The menu on the left has three groups:

| Group | What's inside |
| --- | --- |
| **Homepage** | Banners, Brands, Testimonials, Stats, "Why AdPulse" items, and the **Home page** texts |
| **Content** | Case studies, Services, Industries, and the **Media library** (all images) |
| **Settings** | **Site settings** (logo, phone, email, address, social links, Google reviews, SEO), **Header** (menu and button), Admin users |

## Change a banner

1. Go to **Homepage → Banners** and click the banner you want to change.
2. Edit the fields:
   - **Chip text**: the small label at the top, e.g. "Performance Marketing".
   - **Headline**: the big title.
   - **Highlighted words**: the part of the headline shown in orange. Copy it exactly as it appears in the
     headline, e.g. "Measurable Growth".
   - **Supporting text**, **Button label** and **Button link**. For a page on this site, use a link such as
     `/contact`.
   - **Artwork / background image**: click the image to choose a different one, or upload a new one.
   - **Floating badge text** (optional), e.g. "+3.2x ROI".
3. Click **Save**.

To change how long each banner stays on screen, go to **Homepage → Home page → Banners tab → Banner autoplay speed**.

## Add a case study

1. Go to **Content → Case studies → Create new**.
2. Fill in:
   - **Title**: the client or project name.
   - **Industry**: choose from the list.
   - **Cover image**: upload a photo (landscape, at least 1200 px wide).
   - **Result headline**, e.g. "+32% Patient Enquiries in 90 Days".
   - **Metrics**: exactly three, each with a **value** (e.g. "+32%") and a **label** (e.g. "Enquiries").
   - **Short summary** and **Full case study**: used on the case study's own page.
3. In the right-hand sidebar, tick **Featured on homepage** to show it on the homepage. The **slug** fills itself
   in, so leave it empty.
4. Click **Save**.

## Replace a brand logo

1. Go to **Homepage → Brands** and click the brand.
2. Under **Logo**, click the **×** to remove the current image, then **Upload new** and choose the file. Use an SVG or
   a transparent PNG.
3. Fill in the **Alt text** with the brand name, e.g. "MedCure Hospitals logo".
4. Click **Save**.

To change the AdPulse logo itself, go to **Settings → Site settings → Brand**.

## Reorder items

In any list (Banners, Brands, Case studies, Services, Industries, Testimonials, Stats, Why AdPulse items):

1. Open the list.
2. Grab the **drag handle** (⋮⋮) at the left of a row and drag it up or down.

The website uses the same order. For banners, this sets the slide order.

For menu items, footer links and other lists *inside* a page (such as **Settings → Header → Navigation**), drag the
row by its handle, then click **Save**.

## Hide or show items

- **List items** (a banner, brand, case study and so on): open the item, untick **Visible on website** in the
  right-hand sidebar (for banners it's called **Active**), then click **Save**. The item stays in the admin and you
  can show it again any time. Deleting is permanent, so prefer hiding.
- **Menu items and footer links**: open **Settings → Header** or **Homepage → Home page → Footer**, untick **Show**
  on the item, then **Save**. For example, this is how to hide **Tools** from the menu.

## Images: good to know

- Every image needs **Alt text**: a short description for blind visitors and for Google.
- Upload large, good-quality images. The website automatically makes smaller copies for phones.
- The grey "Placeholder" images are temporary. Replace them with real photos and logos before launch.

## Contact details, social links, Google reviews

Go to **Settings → Site settings**. The tabs are **Brand**, **Contact**, **Google reviews** and **SEO**. These details
are used everywhere on the site, including the header, footer and contact page.
