-- -----------------------------------------------------------------------------
-- Base de données : AGL (Gestion PME Gadgets Animaliers)
-- Cible : MySQL
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS gest_pme;
USE gest_pme;

-- 1. Table EMPLOYES (Table parente pour l'héritage)
CREATE TABLE EMPLOYES (
    matricule_employe INT AUTO_INCREMENT,
    nom_employe VARCHAR(150) NOT NULL,
    prenom_employe VARCHAR(200) NOT NULL,
    email_employe VARCHAR(150) NOT NULL,
    adresse_employe VARCHAR(200),
    matricule_employe_Superviseur INT,
    PRIMARY KEY (matricule_employe),
    CONSTRAINT fk_superviseur FOREIGN KEY (matricule_employe_Superviseur) 
        REFERENCES EMPLOYES(matricule_employe) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2. Table GADGETS
CREATE TABLE GADGETS (
    id_gadget INT AUTO_INCREMENT,
    nom_gadget VARCHAR(200) NOT NULL,
    type_gadget VARCHAR(150) NOT NULL,
    prix_vente_gadget DOUBLE,
    description_gadget TEXT,
    PRIMARY KEY (id_gadget)
) ENGINE=InnoDB;

-- 3. Table CLIENTS
CREATE TABLE CLIENTS (
    id_client INT AUTO_INCREMENT,
    nom_client VARCHAR(150),
    prenom_client VARCHAR(200),
    email_client VARCHAR(150),
    contact_client VARCHAR(50),
    adresse_client VARCHAR(150),
    PRIMARY KEY (id_client)
) ENGINE=InnoDB;

-- 4. Table STOCKS
CREATE TABLE STOCKS (
    id_stock INT AUTO_INCREMENT,
    quantite_disponible INT NOT NULL,
    id_gadget INT NOT NULL,
    PRIMARY KEY (id_stock),
    CONSTRAINT fk_stock_gadget FOREIGN KEY (id_gadget) 
        REFERENCES GADGETS(id_gadget) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Table PRODUCTIONS
CREATE TABLE PRODUCTIONS (
    id_production INT AUTO_INCREMENT,
    date_production DATE NOT NULL,
    quantite_produite INT NOT NULL,
    id_gadget INT NOT NULL,
    PRIMARY KEY (id_production),
    CONSTRAINT fk_prod_gadget FOREIGN KEY (id_gadget) 
        REFERENCES GADGETS(id_gadget)
) ENGINE=InnoDB;

-- 6. Table CAISSIERS (Héritage de EMPLOYES)
CREATE TABLE CAISSIERS (
    matricule_employe INT,
    statut_caissier VARCHAR(150) NOT NULL,
    code_acces VARCHAR(100) NOT NULL,
    PRIMARY KEY (matricule_employe),
    UNIQUE (code_acces),
    CONSTRAINT fk_caissier_emp FOREIGN KEY (matricule_employe) 
        REFERENCES EMPLOYES(matricule_employe) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Table AGENTS_PRODUCTIONS (Héritage de EMPLOYES)
CREATE TABLE AGENTS_PRODUCTIONS (
    matricule_employe INT,
    role_agent VARCHAR(150) NOT NULL,
    PRIMARY KEY (matricule_employe),
    CONSTRAINT fk_agent_emp FOREIGN KEY (matricule_employe) 
        REFERENCES EMPLOYES(matricule_employe) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Table ADMINISTRATIFS (Héritage de EMPLOYES)
CREATE TABLE ADMINISTRATIFS (
    matricule_employe INT,
    poste_administratif VARCHAR(150) NOT NULL,
    PRIMARY KEY (matricule_employe),
    CONSTRAINT fk_admin_emp FOREIGN KEY (matricule_employe) 
        REFERENCES EMPLOYES(matricule_employe) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Table VENTES
CREATE TABLE VENTES (
    id_vente INT AUTO_INCREMENT,
    date_vente DATE NOT NULL,
    matricule_employe INT NOT NULL,
    id_client INT NOT NULL,
    PRIMARY KEY (id_vente),
    CONSTRAINT fk_vente_caissier FOREIGN KEY (matricule_employe) 
        REFERENCES CAISSIERS(matricule_employe),
    CONSTRAINT fk_vente_client FOREIGN KEY (id_client) 
        REFERENCES CLIENTS(id_client)
) ENGINE=InnoDB;

-- 10. Table FACTURES
CREATE TABLE FACTURES (
    id_facture INT AUTO_INCREMENT,
    numero_facture VARCHAR(100) NOT NULL,
    date_facture DATE NOT NULL,
    montant_total DOUBLE NOT NULL,
    id_vente INT NOT NULL,
    PRIMARY KEY (id_facture),
    CONSTRAINT fk_facture_vente FOREIGN KEY (id_vente) 
        REFERENCES VENTES(id_vente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Table CONCERNER (Table de liaison Vente <-> Gadget)
CREATE TABLE CONCERNER (
    id_gadget INT,
    id_vente INT,
    quantite_vendue INT NOT NULL,
    prix_unitaire_appliquer DECIMAL(10,2), -- Changé de VARCHAR à DECIMAL pour le calcul
    PRIMARY KEY (id_gadget, id_vente),
    CONSTRAINT fk_conc_gadget FOREIGN KEY (id_gadget) REFERENCES GADGETS(id_gadget),
    CONSTRAINT fk_conc_vente FOREIGN KEY (id_vente) REFERENCES VENTES(id_vente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Table PARTICIPER (Table de liaison Production <-> Agent)
CREATE TABLE PARTICIPER (
    id_production INT,
    matricule_employe INT,
    duree_participation DOUBLE,
    PRIMARY KEY (id_production, matricule_employe),
    CONSTRAINT fk_part_prod FOREIGN KEY (id_production) REFERENCES PRODUCTIONS(id_production),
    CONSTRAINT fk_part_agent FOREIGN KEY (matricule_employe) REFERENCES AGENTS_PRODUCTIONS(matricule_employe)
) ENGINE=InnoDB;