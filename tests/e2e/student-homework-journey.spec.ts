import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test: Student Homework Completion Journey
 *
 * This test covers the complete student workflow from login to homework
 * completion and iPad unlock reward system.
 */

// Test data
const STUDENT_USER = {
  email: 'emma.year3@test.com',
  password: 'TestPassword123!',
  displayName: 'Emma',
  yearLevel: 3,
}

const HOMEWORK_DATA = {
  subject: 'English',
  title: 'Reading Comprehension - Australian Animals',
  expectedQuestions: 5,
  targetScore: 90,
}

test.describe('Student Homework Journey', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage

    // Navigate to the application
    await page.goto('/')

    // Verify page loads correctly
    await expect(page).toHaveTitle(/Family Learning Web/)
  })

  test('Complete student homework workflow with iPad unlock', async () => {
    // Step 1: Student Login
    await test.step('Student logs into the system', async () => {
      await page.getByRole('link', { name: 'Login' }).click()

      await expect(page).toHaveURL(/.*\/auth\/login/)
      await expect(
        page.getByRole('heading', { name: 'Student Login' })
      ).toBeVisible()

      // Fill login form
      await page.getByLabel('Email').fill(STUDENT_USER.email)
      await page.getByLabel('Password').fill(STUDENT_USER.password)

      // Submit form
      await page.getByRole('button', { name: 'Sign In' }).click()

      // Verify successful login
      await expect(page).toHaveURL(/.*\/dashboard/)
      await expect(
        page.getByText(`Welcome back, ${STUDENT_USER.displayName}!`)
      ).toBeVisible()
    })

    // Step 2: Navigate to Homework Section
    await test.step('Navigate to homework assignments', async () => {
      // Check for homework notification or navigate directly
      const homeworkBadge = page.getByTestId('homework-notification-badge')
      if (await homeworkBadge.isVisible()) {
        await expect(homeworkBadge).toContainText(/\d+/) // Should show number of assignments
      }

      await page.getByRole('link', { name: 'Homework' }).click()
      await expect(page).toHaveURL(/.*\/homework/)
      await expect(
        page.getByRole('heading', { name: 'My Assignments' })
      ).toBeVisible()
    })

    // Step 3: Select and Start Assignment
    await test.step('Select homework assignment', async () => {
      // Find the target assignment
      const assignmentCard = page.getByTestId(
        `assignment-${HOMEWORK_DATA.subject.toLowerCase()}`
      )
      await expect(assignmentCard).toBeVisible()

      // Verify assignment details
      await expect(assignmentCard.getByText(HOMEWORK_DATA.title)).toBeVisible()
      await expect(
        assignmentCard.getByText(`${HOMEWORK_DATA.expectedQuestions} questions`)
      ).toBeVisible()

      // Check for due date and status
      const statusBadge = assignmentCard.getByTestId('assignment-status')
      await expect(statusBadge).toContainText(/Due|In Progress|Available/)

      // Start the assignment
      await assignmentCard
        .getByRole('button', { name: 'Start Assignment' })
        .click()

      // Verify navigation to exercise page
      await expect(page).toHaveURL(/.*\/assignments\/.*\/exercise/)
      await expect(
        page.getByRole('heading', { name: HOMEWORK_DATA.title })
      ).toBeVisible()
    })

    // Step 4: Complete Exercise Questions
    await test.step('Answer homework questions', async () => {
      // Verify exercise UI elements
      await expect(page.getByTestId('progress-bar')).toBeVisible()
      await expect(page.getByTestId('question-counter')).toContainText('1 of 5')
      await expect(page.getByTestId('timer')).toBeVisible()

      // Answer each question
      for (
        let questionNum = 1;
        questionNum <= HOMEWORK_DATA.expectedQuestions;
        questionNum++
      ) {
        await test.step(`Answer question ${questionNum}`, async () => {
          // Wait for question to load
          const questionContainer = page.getByTestId('question-container')
          await expect(questionContainer).toBeVisible()

          // Check question type and answer accordingly
          const questionType = await page
            .getByTestId('question-type')
            .textContent()

          switch (questionType) {
            case 'multiple-choice':
              // Select the first option for demo (in real test, would select correct answer)
              await page.getByRole('radio').first().check()
              break

            case 'true-false':
              // Select true/false based on question content
              await page.getByRole('radio', { name: 'True' }).check()
              break

            case 'fill-blank':
              // Fill in blank fields
              const blankInputs = page.getByTestId('blank-input')
              const inputCount = await blankInputs.count()
              for (let i = 0; i < inputCount; i++) {
                await blankInputs.nth(i).fill('answer')
              }
              break

            case 'matching':
              // Perform drag and drop matching
              const leftItems = page.getByTestId('match-left-item')
              const rightItems = page.getByTestId('match-right-item')
              const leftCount = await leftItems.count()

              for (let i = 0; i < leftCount; i++) {
                await leftItems.nth(i).dragTo(rightItems.nth(i))
              }
              break
          }

          // Submit answer if not last question
          if (questionNum < HOMEWORK_DATA.expectedQuestions) {
            await page.getByRole('button', { name: 'Next Question' }).click()

            // Verify progress update
            await expect(page.getByTestId('question-counter')).toContainText(
              `${questionNum + 1} of ${HOMEWORK_DATA.expectedQuestions}`
            )
          } else {
            // Final submission
            await page
              .getByRole('button', { name: 'Submit Assignment' })
              .click()
          }

          // Small delay to ensure smooth progression
          await page.waitForTimeout(500)
        })
      }
    })

    // Step 5: Review Results
    await test.step('Review assignment results', async () => {
      // Wait for results page to load
      await expect(page).toHaveURL(/.*\/assignments\/.*\/results/)
      await expect(
        page.getByRole('heading', { name: 'Assignment Complete!' })
      ).toBeVisible()

      // Check score display
      const scoreDisplay = page.getByTestId('final-score')
      await expect(scoreDisplay).toBeVisible()

      const scoreText = await scoreDisplay.textContent()
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0')

      // Verify score is reasonable (should be between 0 and 100)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)

      // Check for detailed feedback
      await expect(page.getByTestId('question-feedback')).toBeVisible()

      // Verify time spent is displayed
      const timeSpent = page.getByTestId('time-spent')
      await expect(timeSpent).toBeVisible()
      await expect(timeSpent).toContainText(/\d+ minutes/)

      // Check for subject performance update
      const subjectProgress = page.getByTestId('subject-progress')
      await expect(subjectProgress).toContainText(HOMEWORK_DATA.subject)
    })

    // Step 6: iPad Unlock Reward System
    await test.step('Verify iPad unlock reward', async () => {
      const scoreText = await page.getByTestId('final-score').textContent()
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0')

      if (score >= HOMEWORK_DATA.targetScore) {
        // High score should trigger iPad unlock
        const unlockNotification = page.getByTestId('ipad-unlock-notification')
        await expect(unlockNotification).toBeVisible()

        // Check unlock details
        await expect(
          unlockNotification.getByText(/iPad time unlocked/i)
        ).toBeVisible()
        const unlockTime = unlockNotification.getByTestId('unlock-minutes')
        await expect(unlockTime).toBeVisible()

        // Verify unlock time is reasonable (15-60 minutes)
        const minutes = parseInt((await unlockTime.textContent()) || '0')
        expect(minutes).toBeGreaterThanOrEqual(15)
        expect(minutes).toBeLessThanOrEqual(60)

        // Check for achievement badges
        const achievementBadges = page.getByTestId('achievement-badge')
        if ((await achievementBadges.count()) > 0) {
          await expect(achievementBadges.first()).toBeVisible()
        }

        // Verify parent notification option
        const parentNotificationToggle = page.getByTestId(
          'notify-parent-toggle'
        )
        if (await parentNotificationToggle.isVisible()) {
          await expect(parentNotificationToggle).toBeChecked()
        }
      } else {
        // Lower score should show encouragement
        const encouragementMessage = page.getByTestId('encouragement-message')
        await expect(encouragementMessage).toBeVisible()
        await expect(encouragementMessage).toContainText(/Keep practicing/i)
      }
    })

    // Step 7: Navigate to Mistake Book (if applicable)
    await test.step('Add mistakes to mistake book', async () => {
      // Check if there are any incorrect answers
      const mistakesList = page.getByTestId('mistakes-list')
      if (await mistakesList.isVisible()) {
        const mistakeCount = await mistakesList
          .getByTestId('mistake-item')
          .count()

        if (mistakeCount > 0) {
          // Add mistakes to mistake book
          await page
            .getByRole('button', { name: 'Add to Mistake Book' })
            .click()

          // Verify confirmation
          const confirmationToast = page.getByTestId(
            'mistake-book-confirmation'
          )
          await expect(confirmationToast).toBeVisible()
          await expect(confirmationToast).toContainText(
            /added to mistake book/i
          )

          // Navigate to mistake book to verify
          await page.getByRole('link', { name: 'Mistake Book' }).click()
          await expect(page).toHaveURL(/.*\/mistakes/)

          // Verify mistakes appear in mistake book
          const mistakeBookItems = page.getByTestId('mistake-book-item')
          await expect(mistakeBookItems.first()).toBeVisible()
        }
      }
    })

    // Step 8: Return to Dashboard and Verify Updates
    await test.step('Verify dashboard updates', async () => {
      await page.getByRole('link', { name: 'Dashboard' }).click()
      await expect(page).toHaveURL(/.*\/dashboard/)

      // Check for updated progress indicators
      const progressCards = page.getByTestId('subject-progress-card')
      const englishCard = progressCards.filter({ hasText: 'English' })
      await expect(englishCard).toBeVisible()

      // Verify recent activity shows completed assignment
      const recentActivity = page.getByTestId('recent-activity')
      await expect(recentActivity).toBeVisible()
      await expect(recentActivity.getByText(HOMEWORK_DATA.title)).toBeVisible()

      // Check iPad unlock status on dashboard
      const ipadStatus = page.getByTestId('ipad-unlock-status')
      await expect(ipadStatus).toBeVisible()

      // Verify achievement progress
      const achievementProgress = page.getByTestId('achievement-progress')
      if (await achievementProgress.isVisible()) {
        await expect(achievementProgress).toContainText(/\d+/) // Should show some progress
      }
    })

    // Step 9: Logout
    await test.step('Student logs out', async () => {
      await page.getByTestId('user-menu').click()
      await page.getByRole('menuitem', { name: 'Sign Out' }).click()

      // Verify redirect to home page
      await expect(page).toHaveURL(/.*\//)
      await expect(
        page.getByText('Welcome to Family Learning Web')
      ).toBeVisible()
    })
  })

  test('Handle exercise with time limit', async () => {
    // Login and navigate to timed exercise
    await loginAsStudent()
    await navigateToTimedExercise()

    await test.step('Complete exercise within time limit', async () => {
      // Verify timer is visible and counting down
      const timer = page.getByTestId('exercise-timer')
      await expect(timer).toBeVisible()

      const initialTime = await timer.textContent()
      expect(initialTime).toMatch(/\d{2}:\d{2}/) // MM:SS format

      // Answer questions quickly
      await answerQuestionsRapidly()

      // Submit before timeout
      await page.getByRole('button', { name: 'Submit Assignment' }).click()

      // Verify submission was successful
      await expect(
        page.getByText('Assignment submitted successfully')
      ).toBeVisible()

      // Check for speed bonus
      const speedBonus = page.getByTestId('speed-bonus')
      if (await speedBonus.isVisible()) {
        await expect(speedBonus).toContainText(/speed bonus/i)
      }
    })
  })

  test('Handle network interruption during exercise', async () => {
    await loginAsStudent()
    await startExercise()

    await test.step('Simulate network interruption', async () => {
      // Answer some questions
      await answerQuestion(1)

      // Simulate offline mode
      await page.context().setOffline(true)

      // Try to continue - should show offline indicator
      const offlineIndicator = page.getByTestId('offline-indicator')
      await expect(offlineIndicator).toBeVisible()

      // Try to submit - should queue for later
      await page.getByRole('button', { name: 'Next Question' }).click()

      // Restore network
      await page.context().setOffline(false)

      // Verify auto-sync
      await expect(page.getByTestId('sync-indicator')).toBeVisible()
      await expect(offlineIndicator).not.toBeVisible()
    })
  })

  // Helper functions
  async function loginAsStudent() {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(STUDENT_USER.email)
    await page.getByLabel('Password').fill(STUDENT_USER.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/.*\/dashboard/)
  }

  async function navigateToTimedExercise() {
    await page.getByRole('link', { name: 'Practice Exercises' }).click()
    await page.getByTestId('timed-exercise-card').click()
  }

  async function startExercise() {
    await page.getByRole('link', { name: 'Homework' }).click()
    await page.getByTestId('assignment-card').first().click()
    await page.getByRole('button', { name: 'Start Assignment' }).click()
  }

  async function answerQuestionsRapidly() {
    const totalQuestions = 5
    for (let i = 1; i <= totalQuestions; i++) {
      await answerQuestion(i)
      if (i < totalQuestions) {
        await page.getByRole('button', { name: 'Next Question' }).click()
      }
    }
  }

  async function answerQuestion(questionNumber: number) {
    // Quick answer - select first available option
    const options = page.getByRole('radio')
    if ((await options.count()) > 0) {
      await options.first().check()
    } else {
      // Handle other question types
      const textInput = page.getByRole('textbox')
      if ((await textInput.count()) > 0) {
        await textInput.first().fill('answer')
      }
    }

    // Small delay to simulate reading time
    await page.waitForTimeout(200)
  }
})

/**
 * Accessibility-specific tests for the homework journey
 */
test.describe('Student Homework Journey - Accessibility', () => {
  test('Complete homework using only keyboard navigation', async ({ page }) => {
    await page.goto('/auth/login')

    // Login using only keyboard
    await page.keyboard.press('Tab') // Navigate to email field
    await page.keyboard.type(STUDENT_USER.email)
    await page.keyboard.press('Tab') // Navigate to password field
    await page.keyboard.type(STUDENT_USER.password)
    await page.keyboard.press('Tab') // Navigate to submit button
    await page.keyboard.press('Enter') // Submit form

    // Navigate to homework using keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Click homework link

    // Continue exercise using only keyboard
    await page.keyboard.press('Tab') // Navigate to first assignment
    await page.keyboard.press('Enter') // Start assignment

    // Answer question using keyboard
    await page.keyboard.press('Tab') // Navigate to first option
    await page.keyboard.press('Space') // Select option
    await page.keyboard.press('Tab') // Navigate to next button
    await page.keyboard.press('Enter') // Continue

    // Verify keyboard navigation works throughout
    await expect(page.locator(':focus')).toBeVisible()
  })

  test('Screen reader compatibility for exercise interface', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    // Check for proper ARIA labels
    await expect(page.getByLabel('Email')).toHaveAttribute(
      'aria-required',
      'true'
    )
    await expect(page.getByLabel('Password')).toHaveAttribute(
      'aria-required',
      'true'
    )

    // Login and navigate to exercise
    await page.getByLabel('Email').fill(STUDENT_USER.email)
    await page.getByLabel('Password').fill(STUDENT_USER.password)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await page.getByRole('link', { name: 'Homework' }).click()
    await page.getByRole('button', { name: 'Start Assignment' }).first().click()

    // Verify exercise has proper semantic structure
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check question structure
    const questionText = page.getByRole('group', { name: /question/i })
    await expect(questionText).toBeVisible()

    // Verify answer options have proper labels
    const radioButtons = page.getByRole('radio')
    const radioCount = await radioButtons.count()
    for (let i = 0; i < radioCount; i++) {
      await expect(radioButtons.nth(i)).toHaveAccessibleName()
    }

    // Check progress information is announced
    const progressInfo = page.getByLabelledBy('progress-label')
    if (await progressInfo.isVisible()) {
      await expect(progressInfo).toHaveAttribute('aria-live', 'polite')
    }
  })
})

/**
 * Performance tests for homework journey
 */
test.describe('Student Homework Journey - Performance', () => {
  test('Exercise loads within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/auth/login')

    // Measure login performance
    const loginStart = Date.now()
    await page.getByLabel('Email').fill(STUDENT_USER.email)
    await page.getByLabel('Password').fill(STUDENT_USER.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL(/.*\/dashboard/)
    const loginTime = Date.now() - loginStart

    expect(loginTime).toBeLessThan(3000) // Login should complete within 3 seconds

    // Measure homework page load
    const homeworkStart = Date.now()
    await page.getByRole('link', { name: 'Homework' }).click()
    await page.waitForURL(/.*\/homework/)
    await page.waitForSelector('[data-testid="assignment-card"]')
    const homeworkTime = Date.now() - homeworkStart

    expect(homeworkTime).toBeLessThan(2000) // Homework page should load within 2 seconds

    // Measure exercise start
    const exerciseStart = Date.now()
    await page.getByRole('button', { name: 'Start Assignment' }).first().click()
    await page.waitForSelector('[data-testid="question-container"]')
    const exerciseTime = Date.now() - exerciseStart

    expect(exerciseTime).toBeLessThan(2000) // Exercise should start within 2 seconds
  })
})
