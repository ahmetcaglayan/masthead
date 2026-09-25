# Microsoft Store

Masthead is in the Microsoft Store as **Masthead News** (the name "Masthead" was taken there).

| | |
| --- | --- |
| Store page | https://apps.microsoft.com/detail/9PFZD4CRGSQV |
| Product ID | `9PFZD4CRGSQV` |
| Partner Center | https://partner.microsoft.com/dashboard/products/9PFZD4CRGSQV/overview |
| Package identity | `AHCA.MastheadNews`, publisher `CN=2AF3F876-B6CA-4908-B249-C6DD1C654700` (see `appx` in `electron-builder.yml`) |

The Store build is the same app as the Windows installer, packaged as MSIX (`.appx` per architecture, bundled
into a `.msixbundle`). Microsoft signs it during certification, so it needs no certificate of ours and Windows
shows no SmartScreen warning. Windows updates Store apps in the background, so the app's own GitHub updater is
off in this build (`process.windowsStore` → update mode `store`).

The Store only accepts version numbers whose first part is not 0 and whose fourth part is 0. `x.y.z` in
`package.json` becomes `x.y.z.0`; every submission must be higher than the last one.

## Every release

Pushing a `vX.Y.Z` tag runs `.github/workflows/store.yml` next to the release workflow. It builds
`Masthead-X.Y.Z.msixbundle` and `Masthead-X.Y.Z.msixupload` and keeps them as the run's `store-package-X.Y.Z`
artifact. Then:

- **With the Partner Center secrets set**, it submits the `.msixupload` to the Store. Certification usually takes
  from a few hours to three working days; the new version then reaches users by itself.
- **Without them**, it opens an issue, *Microsoft Store: submit vX.Y.Z*, with a link to the artifact. To submit by
  hand: unzip the artifact, open Partner Center → *Start update* → **Packages**, drop in the `.msixbundle`, remove
  the previous version's package, **Submit to the Store**, and close the issue.

`workflow_dispatch` (Actions → Microsoft Store → Run workflow) builds the package without submitting it or
opening an issue, which is a quick way to check that a change still packages.

## Setting up automatic submission (once)

Automatic submission uses the [Microsoft Store Developer CLI](https://learn.microsoft.com/windows/apps/publish/msstore-dev-cli/github-actions)
and needs a Microsoft Entra ID app that may manage the Partner Center account. It only works once the app is
live in the Store: the first submission is always made by hand.

1. **Tenant.** Partner Center → ⚙ Account settings → *Tenants*: associate an existing Microsoft Entra ID tenant,
   or create a new one there.
2. **App registration.** In the [Microsoft Entra admin center](https://entra.microsoft.com/) → App registrations →
   *New registration* (any name, e.g. "Masthead Store publishing", single tenant, no redirect URI).
   - *Overview* shows the **Application (client) ID** and the **Directory (tenant) ID**.
   - *Certificates & secrets* → *New client secret*: copy its **Value** straight away; it is shown only once.
3. **Access.** Partner Center → ⚙ Account settings → *User management* → *Microsoft Entra applications* → add the
   app you registered and give it the **Manager** role.
4. **Seller ID.** Partner Center → ⚙ Account settings → *Legal info* / *Identifiers*: the **Seller ID**.
5. **Secrets.** GitHub → the repository → Settings → *Secrets and variables* → *Actions* → *New repository secret*,
   one for each:

   | Secret | Value |
   | --- | --- |
   | `AZURE_AD_TENANT_ID` | Directory (tenant) ID |
   | `AZURE_AD_APPLICATION_CLIENT_ID` | Application (client) ID |
   | `AZURE_AD_APPLICATION_SECRET` | the client secret's value |
   | `SELLER_ID` | Seller ID |

The next tag is then submitted by itself. Client secrets expire (24 months at most): when one does, the Store
step fails; make a new secret and replace `AZURE_AD_APPLICATION_SECRET`.

## Store listing

The listing (descriptions, screenshots, category, age rating) lives in Partner Center, not in this repository.
Each language declared in the package (`appx.languages`: en-US, tr-TR, de-DE, fr-FR, pt-BR, hi-IN) needs its own
listing. Screenshots are the 1440×900 images in `site/images/`.
