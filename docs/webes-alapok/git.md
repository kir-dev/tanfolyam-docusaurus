---
sidebar_position: 2
---

# Git és GitHub alapok

## Git bevezető

Miért is elengedhetetlen a Git a modern szoftverfejlesztésben? A Git nem csupán egy mentési lehetőség, hanem egy professzionális **elosztott verziókezelő rendszer**. Lehetővé teszi a **párhuzamos munkavégzést**: saját ágakon (**branch**) dolgozhatsz új funkciókon anélkül, hogy a társad munkáját megzavarod a saját változatásaiddal vagy elrontanád a már működő kódot.\
Emellett a Git teljes körű **verziótörténet**et is biztosít. Minden változtatásod (**commit**) visszakövethető, így ha valami váratlan hiba csúszik a rendszerbe, bármikor visszatérhetsz egy korábbi, stabil állapothoz.\
Kvázi egy időgépként használható. Mintha checkpointokat raknál játék közben egy-egy boss fight előtt/után.

## Git alapfogalmak

- **Repository**: A projekt teljes tárolója, amely tartalmazza az összes fájlt, mappát, és a hozzájuk tartozó teljes módosítási előzményt.
- **Commit**: Egy pillanatkép (**snapshot**) a kód aktuális állapotáról, amelyhez egy egyedi azonosító és egy rövid leírás (**commit message**) tarozik.
- **Branch**: Párhuzamos fejlesztési szál, ahol új funkción dolgozhatnak a felhasználók análkül, hogy a fő kódbázist módosítanák.
- **Codeline**: A fejlesztés folyamatos, időrendi vonala, egy adott ág (**branch**) teljes történetét tartalmazza az első committól az utolsóig.

### Repository

A Git egyik nagy előnye az **osztott (distributed)** felépítés, ami annyit takar, hogy a kód nem csak egy központi szerveren létezik, hanem a teljes projektkönyvtár elérhető a fejlesztő saját számítógépén.\
Tároló lehet helyi (**local**) vagy távoli (**remote**):

- **Local Repository**: A helyi tároló a saját számítógépen található, ebben dolgozol, itt készítesz commit-okat és itt váltasz ágak között. Teljesen privát, amíg nem küldöd el a változtatásaid egy távoli szerverre, addig senki nem látja min dolgozol éppen.

- **Remote Repository**: Egy távoli szerveren található és onnan érhető el a csapat számára. Itt történik a kódmegosztás és a **Pull Request**ek (_lásd lentebb: [GitHub workflow](#github)_) kezelése és a biztonsági mentés is.

![Local vs remote](/img/git-basics/local-vs-remote.png)

#### Kommunikáció local és remote között

A kommunikáció két fő parancs segítségével működik:

- `git pull`: Letöltöd és egyesíted a távoli szerveren lévő új módosításokat a helyi kódoddal. **Fontos:** Alapértelmezés szerint azon az ágon (branchen) történik, amin éppen állsz.
- `git push`: Elvégzett commit-okat feltöltöd a szerverre, ahol mások is látják a változtatásaidat. **Fontos:** Ezzel a saját ágad aktuális állapotát küldöd fel a szerver megfelelő ágára.

## Git Workflow

Git workflow kapcsán érdemes elsősorban tisztázni a négy nagy területet, ami azt mondja meg, hogy hol "lakik" a kód a gépen belül. Ez segít majd megérteni a `git add` és `git commit` parancsok közötti különbséget a későbbiekben.\
A négy terület amit megkülönböztetünk:

- **Working Directory**: A fájlok, amiket éppen szerkesztünk.
- **Staging Area**: Egy "várólista", ahova összeszedjük a módosításokat, amiket majd egy commit-ba be akarunk venni. Gondoljunk úgy rá, mint egy vágólapra másolás és beillesztés között.
- **Local Repository**: A [fentebb részletezett](#repository) helyi tároló a saját gépeden, ahol a projekt története (commitok) létezik.
- **Remote Repository**: A [szintén fentebb részletezett](#repository) távoli szerver (pl. GitHub), ahol a projekt központi változata él.

![Git areas](/img/git-basics/git-areas.png)

### Alapvető parancsok, workflow bemutatása demo segítségével

Hogyan is használjuk a Git-et? Milyen lépéseket kell végrehajtanunk ahhoz, hogy el tudjuk kezdeni a munkát? Ezt a [webes alapok](intro.md) előadáson elkészült demo segítségével fogjuk bemutatni. _GitHub repository [click here]_ **TODO demo elkészítése, szöveg linkké alakítása**

1. Először is a távoli szerverről le kell klónoznunk egy repository-t amiben dolgozni szeretnénk, hogy a gépünön is meglegyen. Ehhez használjuk a `git clone <repo_url>` parancsot. (_Ekkor a teljes projekt a **working directoryba** kerül._)
2. Hozzunk magunknak létre egy új ágat (**branchet**) `git checkout -b <branch_name>`. Ezen már elkezdhetünk dolgozni.
3. Amint elkészültünk egy nagyobb funkcióval, adjuk a fájlokat a **staging area**-hoz a `git add <file_name>` paranccsal vagy amennyiben az összes módosított fájlt hozzá szeretnénk adni a `git add .` parancsot használjuk.
4. Következő lépésként hozzuk létre a commit-ot a `git commit -m "commit_message"` paranccsal. Ekkor a módosításaink bekerülnek a **local repository**-ba.
5. Végül a `git push origin <branch_name>` paranccsal feltöltjük a módosításainkat a **remote repository**-ba, ahol mások is elérhetik azokat.

## GitHub

A **GitHub** egy felhőalapú platform, amely a Git verziókezelő rendszerre épül, és lehetővé teszi a fejlesztők számára, hogy a távoli repository-kat hozzanak létre, kezeljenek, és osszanak meg másokkal.\
Megkönnyíti a Git használatát, többé nem feltétlenül szükséges a parancsok manuális használata.

### Ahol a csapatmunka folyik

Igaz, a Git kezeli a kód verzióit, a GitHub ad egy keretet a közös fejlesztésnek. A legfontosabb elemek a munkafolyamat során az **Issues**, **Pull Requests** és az **Actions** elemek lesznek.

#### Issues

A GitHub Issues egy feladatkezelő rendszer, amely lehetővé teszi a fejlesztők számára, hogy új funkciókat írjanak ki feladatként, rövid leírással és címkékkel. Emellett hibajegyeket is létrehozhatnak, ahol a csapat tagjai nyomon követhetik a problémákat és azok megoldását.\
Az Issues segít rendszerezni a munkát és biztosítja, hogy mindenki tisztában legyen az aktuális feladatokkal.

#### Pull Requests

A Pull Request (sokszor rövidítve PR) a GitHub egyik legtöbbet használt funkciója, célja, hogy megkönnyítse a kódok felülvizsgálatát és integrációját a fő ágba. Amikor végzünk egy funkcióval a saját branch-ünkön `git push` után létrehozunk egy Pull Request-et a GitHub repository-ban. Ez jelzi a csapat többi tagjának, hogy szeretnénk a kódunkat behúzni a fő ágba.\
Megszokott eljárás ilyenkor, hogy egy másik fejlesztő átnézi a kódunkat (review) és visszajelzést ad az esetleges hibákról vagy elfogadja azt. Emellett a PR lehetőséget ad arra, hogy automatizált teszteket és különböző statikus elemzéseket futtassunk a kódon. Ebben segít az úgynevezett **GitHub Actions**.

![GitHub PR](/img/git-basics/github-pr.png)

#### Actions

A GitHub Actions egy beépített CI/CD (Continuous Integration/Continuous Deployment) szolgáltatás, amely lehetővé teszi, hogy automatizált munkafolyamatokat hozzunk létre a repository-nkban.\
Gyakori felhasználási módja az előző bekezdésben említett PR-ek esetén a statikus analízis futtatása. Ennek lényege, hogy a kódot automatikusan ellenőrizzük különböző szabályok alapján, például kódstílus, biztonsági rések vagy potenciális hibák szempontjából.\
Ezen kívül a GitHub Actions segítségével automatizálhatjuk a tesztelések futtatását, a build folyamatokat, vagy akár a kód telepítését is egy adott környezetbe.

![GitHub Actions](/img/git-basics/github-actions.png)

## GitHub alkalmazása demo projektben

A [fejezetben korábban](#alapvető-parancsok-workflow-bemutatása-demo-segítségével) már leklónoztuk a demo projektet, módosítottunk rajta és commit-oltunk is. Most pedig a GitHub oldalán megnézzük hogyan is néz ki a workflow a gyakorlatban.

1. Mivel már elvégeztük a `git push`-t, nézzük meg a repository oldalán, hogy megjelent-e a Pull Request létrehozására szolgáló gomb.
2. Hozzunk létre egy új PR-t, adjunk neki egy címet és egy rövid leírást.
3. Amikor létrehoztuk, kérjük meg a csoporttársunkat, hogy nézze át a kódunkat és hagyja jóvá a PR-t. Ehhez a **Reviewers** résznél adjuk hozzá a társunk GitHub felhasználónevét.
4. A **Files changed** fül alatt kezdjük meg a kód átnézését a **start review** gombra kattintva. Amennyiben hibát találunk, kommenteljük azt a megfelelő sor mellett a plusz ikonra kattintva.
5. Ha minden rendben van, hagyjuk jóvá a PR-t a **Approve** gombra kattintva, majd kattintsunk a **Merge pull request** gombra a PR egyesítéséhez a fő ágba.

**TODO demo elkészítése, link beszúrása**

Ha minden rendben ment, akkor a branch be lett integrálva a fő ágba és a változtatásaink elérhetőek a projekt fő verziójában is.

---

Készítette: [Iván Domonkos](https://github.com/IvnDmnks)
