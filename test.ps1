# Social Media API Test Script
# PowerShell Compatible


$BASE = "http://localhost:3000/api"

function Show-Menu {
    Write-Host ""
    Write-Host "API TEST MENU"
    Write-Host "1. Create User"
    Write-Host "2. Get All Users"
    Write-Host "3. Create Post"
    Write-Host "4. Follow User"
    Write-Host "5. Like Post"
    Write-Host "6. Get Feed"
    Write-Host "7. User Activity"
    Write-Host "0. Exit"
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Choose"

    switch ($choice) {

     
        # CREATE USER
      
        1 {
            $firstName = Read-Host "First Name"
            $lastName  = Read-Host "Last Name"
            $email     = Read-Host "Email"

            Invoke-RestMethod `
                -Method POST `
                -Uri "$BASE/users" `
                -Headers @{ "Content-Type" = "application/json" } `
                -Body "{
                    `"firstName`": `"$firstName`",
                    `"lastName`": `"$lastName`",
                    `"email`": `"$email`"
                }" | Format-List
        }

     
        # GET ALL USERS
      
        2 {
            Invoke-RestMethod `
                -Method GET `
                -Uri "$BASE/users" | Format-Table
        }

        
        # CREATE POST
        
        3 {
            $userId  = Read-Host "User ID"
            $content = Read-Host "Post content"
            $tag     = Read-Host "Hashtag (without #)"

            Invoke-RestMethod `
                -Method POST `
                -Uri "$BASE/posts" `
                -Headers @{ "Content-Type" = "application/json" } `
                -Body "{
                    `"userId`": $userId,
                    `"content`": `"$content`",
                    `"hashtags`": [`"$tag`"]
                }" | Format-List
        }

    
        # FOLLOW USER
       
        4 {
            $followerId  = Read-Host "Follower User ID"
            $followingId = Read-Host "Following User ID"

            Invoke-RestMethod `
                -Method POST `
                -Uri "$BASE/follows" `
                -Headers @{ "Content-Type" = "application/json" } `
                -Body "{
                    `"followerId`": $followerId,
                    `"followingId`": $followingId
                }" | Format-List
        }

      
        # LIKE POST
        
        5 {
            $postId = Read-Host "Post ID"
            $userId = Read-Host "User ID"

            $likeUrl = "$BASE/posts/$postId/like"

            Invoke-RestMethod `
                -Method POST `
                -Uri $likeUrl `
                -Headers @{ "Content-Type" = "application/json" } `
                -Body "{
                    `"userId`": $userId
                }" | Format-List
        }

      
        # GET FEED
       
        6 {
            $userId = Read-Host "User ID"

            Invoke-RestMethod `
                -Method GET `
                -Uri "$BASE/feed?userId=$userId" | ConvertTo-Json -Depth 6
        }

      
        # USER ACTIVITY
      
        7 {
            $userId = Read-Host "User ID"

            Invoke-RestMethod `
                -Method GET `
                -Uri "$BASE/users/$userId/activity" | ConvertTo-Json -Depth 6
        }

       
        # EXIT
       
        0 {
            Write-Host "Exiting..."
            break
        }

        default {
            Write-Host "Invalid choice"
        }
    }
}
