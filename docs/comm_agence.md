# Résumé des Commissions (2022-2025) - Allianz Marseille

## Spécification UX (navigation et présentation)
- **Périmètre des données**: historique à partir de 2022 uniquement; aucune donnée disponible avant 2022.
- **Navigation annuelle (moderne et fluide)**:
  - Par défaut, afficher l’**année en cours**.
  - Contrôles de navigation pour changer d’année dans l’intervalle 
    **2022 → année en cours** (impossible d’aller avant 2022 ni après l’année en cours).
  - **Bouton “Reset”** adjacent aux contrôles, qui ramène instantanément à l’**année en cours**.
  - Idées d’UI possibles: boutons précédent/suivant, select d’année, ou chips cliquables (au choix, tant que l’interaction est rapide et sans rechargement visible).
- **Présentation type tableur**:
  - Organisation des données conforme à l’image fournie: lignes par catégories (IARD, Vie, Courtage, Profits/Total/Charges/Résultat/Prélèvements) et colonnes par mois + total.
  - Totaux mensuels et annuels calculés et affichés, mise en évidence des lignes clés (Total commissions, Résultat).
  - L’orientation visuelle doit reprendre l’**organisation** de l’image (pas le style graphique).

## Persistance des données
- **Firestore**: créer la collection `agency_commissions`.
  - Document ID: `YYYY` (ex: `2025`).
  - Champs: `{ year: number, rows: Array<{ label: string; values: number[12] }>, updatedAt: ISO-string }`.
- **Seed initial**: API POST `/api/commissions/seed` (header `x-seed-secret: $SEED_COMMISSIONS_SECRET`) qui charge les valeurs depuis le dataset local (docs/comm_agence.md / src/lib/commissions.ts).
- **Lecture**: 
  - GET `/api/commissions/[year]` → un document par année.
  - GET `/api/commissions/years` → liste des années disponibles.
- **Comportement UI**: la page Commissions tente la lecture Firestore; si indisponible, fallback sur le dataset local.

## 2022
| Catégorie                | Janvier | Février | Mars   | Avril | Mai   | Juin  | Juillet | Août  | Septembre | Octobre | Novembre | Décembre | Total     |
|--------------------------|---------|---------|--------|-------|-------|-------|---------|-------|-----------|---------|----------|----------|-----------|
| Commissions IARD         | 58 546  | 52 371  | 50 389 | 45 942| 43 853| 44 665| 83 728  | 44 814| 46 798    | 47 574  | 43 729   | 47 409   | 609 818  |
| Commissions Vie          | 4 680   | 29 497  | 2 359  | 9 783 | 7 802 | 3 805 | 4 297   | 8 046 | 2 705     | 3 135   | 8 372    | 2 730    | 87 211   |
| Commissions Courtage     | 2 707   | 3 844   | 2 403  | 3 713 | 4 406 | 3 628 | 2 758   | 7 553 | 2 998     | 3 602   | 5 390    | 5 043    | 48 045   |
| Total commissions        | 65 933  | 85 712  | 55 151 | 59 438| 56 061| 52 098| 90 783  | 60 413| 52 501    | 54 311  | 57 491   | 55 182   | 745 074  |
| Charges agence           | 27 391  | 35 936  | 27 295 | 43 619| 34 926| 40 174| 32 446  | 37 051| 32 880    | 42 554  | 35 522   | 39 196   | 428 990  |
| Résultat                 | 38 542  | 49 776  | 27 856 | 15 819| 21 135| 11 924| 58 337  | 23 362| 19 621    | 11 757  | 21 969   | 15 986   | 316 084  |
| Prélèvements Julien      | 13 000  | 25 000  | 13 000 | 13 000| 12 500| 13 500| 23 000  | 12 000| 13 500    | 13 500  | 6 500    | 12 500   | 171 000  |
| Prélèvements Jean-Michel | 13 000  | 25 000  | 13 000 | 13 000| 12 500| 13 500| 23 000  | 12 000| 13 500    | 13 500  | 6 500    | 12 500   | 171 000  |

---

## 2023
| Catégorie                | Janvier | Février | Mars   | Avril | Mai   | Juin  | Juillet | Août  | Septembre | Octobre | Novembre | Décembre | Total     |
|--------------------------|---------|---------|--------|-------|-------|-------|---------|-------|-----------|---------|----------|----------|-----------|
| Commissions IARD         | 50 747  | 62 205  | 52 309 | 55 232| 52 594| 52 029| 75 777  | 55 400| 56 408    | 55 409  | 59 763   | 52 203   | 680 076  |
| Commissions Vie          | 4 298   | 27 998  | 2 533  | 12 705| 9 904 | 4 588 | 4 519   | 8 401 | 3 146     | 3 371   | 9 642    | 2 885    | 93 990   |
| Commissions Courtage     | 3 523   | 5 412   | 5 444  | 7 049 | 4 007 | 6 717 | 5 964   | 6 168 | 5 569     | 4 727   | 4 963    | 5 558    | 65 101   |
| Total commissions        | 58 568  | 95 615  | 60 286 | 74 986| 66 505| 63 334| 86 260  | 69 969| 65 123    | 63 507  | 74 368   | 60 646   | 839 167  |
| Charges agence           | 31 442  | 45 490  | 41 445 | 38 560| 49 492| 37 779| 51 224  | 49 519| 41 293    | 44 010  | 34 293   | 62 724   | 527 271  |
| Résultat                 | 27 126  | 50 125  | 18 841 | 36 426| 17 013| 25 555| 35 036  | 20 450| 23 830    | 19 497  | 40 075   | -2 078   | 311 896  |
| Prélèvements Julien      | 22 000  | 22 000  | 12 000 | 10 000| 12 500| 10 000| 12 500  | 20 000| 10 000    | 14 000  | 14 000   | 14 000   | 173 000  |
| Prélèvements Jean-Michel | 22 000  | 22 000  | 12 000 | 10 000| 12 500| 10 000| 12 500  | 20 000| 10 000    | 14 000  | 14 000   | 14 000   | 173 000  |

---

## 2024
| Catégorie                | Janvier | Février | Mars   | Avril | Mai   | Juin  | Juillet | Août  | Septembre | Octobre | Novembre | Décembre | Total     |
|--------------------------|---------|---------|--------|-------|-------|-------|---------|-------|-----------|---------|----------|----------|-----------|
| Commissions IARD         | 69 096  | 65 309  | 61 564 | 58 206| 58 536| 63 747| 78 374  | 61 693| 66 719    | 61 674  | 64 675   | 68 915   | 778 508  |
| Commissions Vie          | 4 594   | 29 334  | 2 857  | 16 836| 14 167| 2 103 | 7 997   | 9 373 | 2 656     | 5 594   | 3 857    | 8 546    | 107 914  |
| Commissions Courtage     | 3 480   | 5 260   | 4 446  | 8 321 | 7 013 | 3 765 | 4 468   | 10 340| 3 685     | 4 908   | 6 469    | 3 919    | 66 074   |
| Total commissions        | 77 170  | 99 903  | 68 867 | 83 363| 79 716| 69 615| 90 839  | 81 406| 73 060    | 72 176  | 75 001   | 81 380   | 952 496  |
| Charges agence           | 51 946  | 56 200  | 40 711 | 54 384| 54 350| 51 219| 56 893  | 50 871| 56 607    | 55 565  | 73 049   | 52 004   | 653 799  |
| Résultat                 | 25 224  | 43 703  | 28 156 | 28 979| 25 366| 18 396| 33 946  | 30 535| 16 453    | 16 611  | 1 952    | 29 376   | 298 697  |
| Prélèvements Julien      | 11 000  | 20 000  | 12 500 | 12 000| 12 000| 17 000| 12 000  | 12 000| 12 000    | 12 000  | 5 000    | 13 000   | 155 500  |
| Prélèvements Jean-Michel | 11 000  | 20 000  | 12 500 | 12 000| 12 000| 17 000| 12 000  | 12 000| 12 000    | 12 000  | 5 000    | 13 000   | 155 500  |

---

## 2025
| Catégorie                | Janvier | Février | Mars   | Avril | Mai   | Juin  | Juillet | Août  | Septembre | Octobre | Novembre | Décembre | Total     |
|--------------------------|---------|---------|--------|-------|-------|-------|---------|-------|-----------|---------|----------|----------|-----------|
| Commissions IARD         | 83 717  | 75 088  | 76 902 | 76 694| 71 661| 76 841| 98 375  | 80 991| 0         | 0       | 0        | 0        | 640 269  |
| Commissions Vie          | 5 815   | 31 813  | 3 461  | 5 565 | 10 027| 3 409 | 7 062   | 9 824 | 0         | 0       | 0        | 0        | 76 976   |
| Commissions Courtage     | 6 928   | 6 851   | 4 476  | 4 548 | 5 941 | 4 001 | 4 744   | 11 074| 0         | 0       | 0        | 0        | 48 563   |
| Total commissions        | 96 460  | 113 752 | 84 839 | 87 435| 87 629| 84 251| 110 181 | 101 889| 0         | 0       | 0        | 0        | 765 808  |
| Charges agence           | 54 376  | 63 488  | 64 301 | 57 102| 57 209| 67 596| 61 143  | 66 702| 0         | 0       | 0        | 0        | 491 917  |
| Résultat                 | 42 084  | 50 264  | 20 538 | 30 333| 30 420| 16 655| 49 038  | 35 187| 0         | 0       | 0        | 0        | 274 519  |
| Prélèvements Julien      | 18 000  | 13 000  | 13 000 | 14 400| 12 000| 18 000| 15 500  | 17 000| 0         | 0       | 0        | 0        | 120 900  |
| Prélèvements Jean-Michel | 18 000  | 13 000  | 13 000 | 14 400| 12 000| 18 000| 15 500  | 17 000| 0         | 0       | 0        | 0        | 120 900  |
