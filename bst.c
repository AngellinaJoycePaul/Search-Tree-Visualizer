#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct ParkingSpot {
    int spotID;
    char location[50];
    int isOccupied;
    char vehicleNo[20];
};

struct Node {
    struct ParkingSpot data;
    struct Node* left;
    struct Node* right;
};

struct Node* createNode(int spotID, char* location, int isOccupied, char* vehicleNo) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data.spotID = spotID;
    strcpy(newNode->data.location, location);
    newNode->data.isOccupied = isOccupied;
    strcpy(newNode->data.vehicleNo, vehicleNo);
    newNode->left = NULL;
    newNode->right = NULL;
    return newNode;
}

struct Node* insert(struct Node* root, int spotID, char* location, int isOccupied, char* vehicleNo) {
    if (root == NULL) {
        printf("  [INSERTED] Spot %d at %s\n", spotID, location);
        return createNode(spotID, location, isOccupied, vehicleNo);
    }

    if (spotID < root->data.spotID) {
        root->left = insert(root->left, spotID, location, isOccupied, vehicleNo);
    } else if (spotID > root->data.spotID) {
        root->right = insert(root->right, spotID, location, isOccupied, vehicleNo);
    } else {
        printf("  [DUPLICATE] Spot ID %d already exists!\n", spotID);
    }
    return root;
}

struct Node* search(struct Node* root, int spotID) {
    if (root == NULL) {
        printf("  [NOT FOUND] Spot %d does not exist.\n", spotID);
        return NULL;
    }

    printf("  Visiting Spot %d...\n", root->data.spotID);

    if (spotID == root->data.spotID) {
        printf("\n  [FOUND] Spot %d\n", root->data.spotID);
        printf("  Location  : %s\n", root->data.location);
        printf("  Status    : %s\n", root->data.isOccupied ? "Occupied" : "Available");
        if (root->data.isOccupied)
            printf("  Vehicle   : %s\n", root->data.vehicleNo);
        return root;
    }

    if (spotID < root->data.spotID) {
        printf("  Going LEFT (target < %d)\n", root->data.spotID);
        return search(root->left, spotID);
    } else {
        printf("  Going RIGHT (target > %d)\n", root->data.spotID);
        return search(root->right, spotID);
    }
}

struct Node* findMin(struct Node* root) {
    while (root->left != NULL)
        root = root->left;
    return root;
}

struct Node* deleteNode(struct Node* root, int spotID) {
    if (root == NULL) {
        printf("  [NOT FOUND] Spot %d not available for deletion.\n", spotID);
        return root;
    }

    if (spotID < root->data.spotID) {
        root->left = deleteNode(root->left, spotID);
    } else if (spotID > root->data.spotID) {
        root->right = deleteNode(root->right, spotID);
    } else {
        if (root->left == NULL && root->right == NULL) {
            printf("  [DELETED - Leaf Node] Spot %d removed.\n", root->data.spotID);
            free(root);
            return NULL;
        }
        else if (root->left == NULL) {
            struct Node* temp = root->right;
            printf("  [DELETED - One Child] Spot %d removed.\n", root->data.spotID);
            free(root);
            return temp;
        }
        else if (root->right == NULL) {
            struct Node* temp = root->left;
            printf("  [DELETED - One Child] Spot %d removed.\n", root->data.spotID);
            free(root);
            return temp;
        }
        else {
            struct Node* temp = findMin(root->right);
            root->data = temp->data;
            printf("  [DELETED - Two Children] Replaced with successor Spot %d.\n", temp->data.spotID);
            root->right = deleteNode(root->right, temp->data.spotID);
        }
    }
    return root;
}

void inorder(struct Node* root) {
    if (root != NULL) {
        inorder(root->left);
        printf("  Spot %d | %s | %s\n",
               root->data.spotID,
               root->data.location,
               root->data.isOccupied ? "Occupied" : "Available");
        inorder(root->right);
    }
}

void preorder(struct Node* root) {
    if (root != NULL) {
        printf("  Spot %d\n", root->data.spotID);
        preorder(root->left);
        preorder(root->right);
    }
}

void postorder(struct Node* root) {
    if (root != NULL) {
        postorder(root->left);
        postorder(root->right);
        printf("  Spot %d\n", root->data.spotID);
    }
}

int countAvailable(struct Node* root) {
    if (root == NULL) return 0;
    return (!root->data.isOccupied) + countAvailable(root->left) + countAvailable(root->right);
}

int main() {
    struct Node* root = NULL;
    int choice, spotID, isOccupied;
    char location[50], vehicleNo[20];

    printf("\n");
    printf("=================================================\n");
    printf("   SMART PARKING SYSTEM - BST IMPLEMENTATION\n");
    printf("=================================================\n");

    root = insert(root, 50, "Level 1 - Zone A", 0, "");
    root = insert(root, 30, "Level 1 - Zone B", 1, "KA01AB1234");
    root = insert(root, 70, "Level 2 - Zone A", 0, "");
    root = insert(root, 20, "Level 1 - Zone C", 1, "KA02CD5678");
    root = insert(root, 40, "Level 2 - Zone B", 0, "");
    root = insert(root, 60, "Level 2 - Zone C", 0, "");
    root = insert(root, 80, "Level 3 - Zone A", 1, "KA03EF9012");
    printf("\n  [Sample data loaded]\n");

    while (1) {
        printf("\n");
        printf("-------------------------------------\n");
        printf("              MAIN MENU\n");
        printf("-------------------------------------\n");
        printf("  1. Add Parking Spot\n");
        printf("  2. Search Parking Spot\n");
        printf("  3. Delete Parking Spot\n");
        printf("  4. Display All Spots (Inorder)\n");
        printf("  5. Display Tree (Preorder)\n");
        printf("  6. Display Tree (Postorder)\n");
        printf("  7. Count Available Spots\n");
        printf("  8. Exit\n");
        printf("-------------------------------------\n");
        printf("Enter choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                printf("\n  Enter Spot ID: ");
                scanf("%d", &spotID);
                printf("  Enter Location: ");
                scanf(" %[^\n]", location);
                printf("  Is it Occupied? (0=No, 1=Yes): ");
                scanf("%d", &isOccupied);
                if (isOccupied) {
                    printf("  Enter Vehicle Number: ");
                    scanf("%s", vehicleNo);
                } else {
                    strcpy(vehicleNo, "");
                }
                root = insert(root, spotID, location, isOccupied, vehicleNo);
                break;

            case 2:
                printf("\n  Enter Spot ID to search: ");
                scanf("%d", &spotID);
                printf("\n  --- Search Path ---\n");
                search(root, spotID);
                break;

            case 3:
                printf("\n  Enter Spot ID to delete: ");
                scanf("%d", &spotID);
                printf("\n  --- Deletion Process ---\n");
                root = deleteNode(root, spotID);
                break;

            case 4:
                printf("\n  --- All Parking Spots (Sorted by ID) ---\n");
                if (root == NULL)
                    printf("  [No spots available]\n");
                else
                    inorder(root);
                break;

            case 5:
                printf("\n  --- Tree Structure (Preorder) ---\n");
                if (root == NULL)
                    printf("  [Empty tree]\n");
                else
                    preorder(root);
                break;

            case 6:
                printf("\n  --- Tree Structure (Postorder) ---\n");
                if (root == NULL)
                    printf("  [Empty tree]\n");
                else
                    postorder(root);
                break;

            case 7:
                printf("\n  Available Spots: %d\n", countAvailable(root));
                break;

            case 8:
                printf("\n  Exiting... Thank you!\n\n");
                exit(0);

            default:
                printf("\n  [ERROR] Invalid choice. Try again.\n");
        }
    }
    return 0;
}