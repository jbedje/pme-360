#!/bin/bash

# PME 360 Backend - Script d'Initialisation Production
set -e

echo "🚀 PME 360 Backend - Initialisation Production"
echo "=============================================="
echo ""

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # OpenSSL pour les certificats
    if ! command -v openssl &> /dev/null; then
        log_warning "OpenSSL n'est pas installé (nécessaire pour HTTPS)"
    fi
    
    log_success "Prérequis vérifiés"
}

# Générer les certificats SSL auto-signés
generate_ssl_certificates() {
    log_info "Génération des certificats SSL..."
    
    mkdir -p ssl
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=FR/ST=IDF/L=Paris/O=PME360/CN=localhost"
        
        log_success "Certificats SSL générés"
    else
        log_info "Certificats SSL déjà existants"
    fi
}

# Configurer l'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    if [ ! -f .env ]; then
        if [ -f .env.production ]; then
            cp .env.production .env
            log_success "Fichier .env créé depuis .env.production"
        else
            log_error "Aucun fichier d'environnement trouvé"
            log_info "Créez .env ou .env.production avec vos configurations"
            exit 1
        fi
    else
        log_info "Fichier .env déjà existant"
    fi
    
    # Vérifier les variables critiques
    source .env
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGE_ME_super_secret_jwt_key_for_production_at_least_64_characters_long_2024" ]; then
        log_error "JWT_SECRET doit être configuré avec une valeur unique"
        exit 1
    fi
    
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "CHANGE_ME_pme360_super_secure_password_2024" ]; then
        log_error "POSTGRES_PASSWORD doit être configuré avec une valeur unique"
        exit 1
    fi
    
    log_success "Environnement configuré"
}

# Créer les répertoires nécessaires
create_directories() {
    log_info "Création des répertoires..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p backups
    mkdir -p ssl
    
    log_success "Répertoires créés"
}

# Construire et démarrer les services
start_services() {
    log_info "Construction et démarrage des services..."
    
    # Arrêter les services existants
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    # Construire l'image
    log_info "Construction de l'image Docker..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Démarrer les services
    log_info "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Services démarrés"
}

# Attendre que les services soient prêts
wait_for_services() {
    log_info "Attente de la disponibilité des services..."
    
    # Attendre PostgreSQL
    log_info "Attente de PostgreSQL..."
    while ! docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U pme360 -d pme360 &>/dev/null; do
        sleep 2
    done
    
    # Attendre Redis
    log_info "Attente de Redis..."
    while ! docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping &>/dev/null; do
        sleep 2
    done
    
    # Attendre l'API
    log_info "Attente de l'API..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3000/health &>/dev/null; then
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "L'API n'est pas disponible après $max_attempts tentatives"
        exit 1
    fi
    
    log_success "Tous les services sont prêts"
}

# Initialiser la base de données
init_database() {
    log_info "Initialisation de la base de données..."
    
    # Migration Prisma
    log_info "Exécution des migrations Prisma..."
    docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
    
    # Génération du client Prisma
    docker-compose -f docker-compose.prod.yml exec api npx prisma generate
    
    log_success "Base de données initialisée"
}

# Tester les endpoints critiques
test_endpoints() {
    log_info "Test des endpoints critiques..."
    
    # Test health
    if curl -f http://localhost:3000/health &>/dev/null; then
        log_success "Endpoint /health OK"
    else
        log_error "Endpoint /health KO"
        exit 1
    fi
    
    # Test API info
    if curl -f http://localhost:3000/api/v1 &>/dev/null; then
        log_success "Endpoint /api/v1 OK"
    else
        log_warning "Endpoint /api/v1 non disponible"
    fi
    
    log_success "Tests des endpoints terminés"
}

# Afficher les informations de déploiement
show_deployment_info() {
    echo ""
    echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
    echo "=================================="
    echo ""
    echo "📡 Services disponibles :"
    echo "  🏠 API Backend:      http://localhost:3000"
    echo "  📖 Documentation:    http://localhost:3000/docs"
    echo "  🔍 Health Check:     http://localhost:3000/health"
    echo "  🌐 Nginx Proxy:      http://localhost:80"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "  📊 Logs API:         docker-compose -f docker-compose.prod.yml logs -f api"
    echo "  📋 Status:           docker-compose -f docker-compose.prod.yml ps"
    echo "  🛑 Arrêter:          docker-compose -f docker-compose.prod.yml down"
    echo "  🔄 Redémarrer:       docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "⚠️  N'oubliez pas de :"
    echo "  1. Configurer votre nom de domaine"
    echo "  2. Installer un certificat SSL valide"
    echo "  3. Configurer les sauvegardes"
    echo "  4. Configurer le monitoring"
    echo ""
    log_success "Déploiement terminé !"
}

# Fonction principale
main() {
    check_prerequisites
    create_directories
    setup_environment
    generate_ssl_certificates
    start_services
    wait_for_services
    init_database
    test_endpoints
    show_deployment_info
}

# Gestion des erreurs
trap 'log_error "Script interrompu par une erreur"; exit 1' ERR

# Exécution
main "$@"